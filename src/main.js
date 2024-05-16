"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var OrbitControls_js_1 = require("three/examples/jsm/controls/OrbitControls.js");
var GLTFLoader_js_1 = require("three/addons/loaders/GLTFLoader.js");
var ThreeViewer = /** @class */ (function () {
    function ThreeViewer(container, models, colors, animations, modelsUrl) {
        this.container = container;
        this.currentColor = colors[0];
        this.currentModel = models[0];
        this.currentAnimation = animations[0];
        this.colors = colors;
        this.models = models;
        this.animations = animations;
        this.modelsUrl = modelsUrl;
    }
    ThreeViewer.prototype.start = function () {
        this.initViewer();
        this.loadModel(this.models[0]);
        this.setupUI(this.models, this.colors, this.animations);
        console.log('kek');
    };
    ThreeViewer.prototype.initViewer = function () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
        this.controls = new OrbitControls_js_1.OrbitControls(this.camera, this.renderer.domElement);
    };
    ThreeViewer.prototype.loadModel = function (model) {
        var _this = this;
        var loader = new GLTFLoader_js_1.GLTFLoader();
        var url = this.modelsUrl + model;
        loader.load(url, function (gltf) {
            _this.scene.add(gltf.scene);
            _this.mixer = new THREE.AnimationMixer(gltf.scene);
            _this.changeColor(_this.currentColor);
            _this.animate();
        }, undefined, function (error) {
            console.error('Error loading model:', error);
        });
    };
    ThreeViewer.prototype.setupUI = function (models, colors, animations) {
        var _this = this;
        var _a, _b, _c, _d;
        function createPanel(id) {
            var panel = document.createElement('div');
            panel.id = id;
            panel.classList.add('panel');
            return panel;
        }
        var settingsPanel = createPanel('settings-panel');
        var controlsPanel = createPanel('controls-panel');
        var modelSelector = document.createElement('select');
        var colorSelector = document.createElement('select');
        var animationSelector = document.createElement('select');
        if (!animations.length) {
            animationSelector.disabled = true;
        }
        function makeSelectOptions(selectElement, data, text) {
            for (var i = 0; i < data.length; i++) {
                var option = document.createElement("option");
                option.value = data[i];
                option.text = text ? text + i++ : data[i];
                selectElement.appendChild(option);
            }
        }
        makeSelectOptions(colorSelector, colors);
        makeSelectOptions(modelSelector, models);
        makeSelectOptions(animationSelector, Array.from({ length: this.animations.length }, function (_, i) { return String(i++); }));
        colorSelector.value = this.currentColor;
        modelSelector.value = this.currentModel;
        modelSelector.addEventListener('change', function (event) {
            _this.clearScene();
            var target = event.target;
            _this.loadModel(target.value);
        });
        colorSelector.addEventListener('change', function (event) {
            var target = event.target;
            _this.changeColor(target.value);
        });
        animationSelector.addEventListener('change', function (event) {
            var target = event.target;
            _this.currentAnimation = _this.animations[Number(target.value)];
        });
        var controlsConfig = ['moveLeft', 'moveRight', 'moveBackward', 'moveForward'];
        controlsConfig.forEach(function (item) {
            var controlButton = document.createElement('button');
            controlButton.id = item;
            controlButton.innerHTML = item;
            controlsPanel.appendChild(controlButton);
        });
        settingsPanel.appendChild(modelSelector);
        settingsPanel.appendChild(colorSelector);
        settingsPanel.appendChild(animationSelector);
        this.container.appendChild(settingsPanel);
        this.container.appendChild(controlsPanel);
        (_a = document.getElementById('moveForward')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
            _this.camera.position.z -= 0.5;
        });
        (_b = document.getElementById('moveBackward')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
            _this.camera.position.z += 0.5;
        });
        (_c = document.getElementById('moveLeft')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
            _this.camera.position.x -= 0.5;
        });
        (_d = document.getElementById('moveRight')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', function () {
            _this.camera.position.x += 0.5;
        });
    };
    ThreeViewer.prototype.changeColor = function (color) {
        var newMaterial = new THREE.MeshBasicMaterial({ color: color });
        this.scene.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = newMaterial;
            }
        });
    };
    ThreeViewer.prototype.animate = function () {
        var _this = this;
        var animate = function () {
            requestAnimationFrame(animate);
            if (_this.currentAnimation) {
                _this.mixer.clipAction(_this.currentAnimation).play();
                var clock = new THREE.Clock();
                _this.mixer.update(clock.getDelta());
            }
            _this.controls.update();
            _this.renderer.render(_this.scene, _this.camera);
        };
        animate();
    };
    ThreeViewer.prototype.clearScene = function () {
        this.scene.remove(this.scene.children[0]);
    };
    ThreeViewer.prototype.dispose = function () {
        // Dispose resources
        // Not implemented for simplicity
    };
    return ThreeViewer;
}());
