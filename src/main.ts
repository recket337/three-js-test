import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class ThreeViewer {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private mixer!: THREE.AnimationMixer;

  private container: HTMLDivElement;

  private currentColor: string;
  private currentModel: string;
  private currentAnimation: THREE.AnimationClip;

  private colors: string[];
  private models: string[];
  private animations: THREE.AnimationClip[];

  private modelsUrl: string;


  constructor(container: HTMLDivElement, models: string[], colors: string[], animations: THREE.AnimationClip[], modelsUrl: string) {
    this.container = container;
    this.currentColor = colors[0];
    this.currentModel = models[0];
    this.currentAnimation = animations[0];
    this.colors = colors;
    this.models = models;
    this.animations = animations;
    this.modelsUrl = modelsUrl;
  }

  public start() {
    this.initViewer();
    this.loadModel(this.models[0]);
    this.setupUI(this.models, this.colors, this.animations);
    console.log('kek')
  }

  private initViewer() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  private loadModel(model: string) {
    const loader = new GLTFLoader();
    const url = this.modelsUrl + model;

    loader.load(
      url,
      (gltf) => {
        this.scene.add(gltf.scene);
        this.mixer = new THREE.AnimationMixer(gltf.scene);
        this.changeColor(this.currentColor);
        this.animate();
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }

  private setupUI(models: string[], colors: string[], animations: THREE.AnimationClip[]) {

    function createPanel(id: string) {
      const panel = document.createElement('div');
      panel.id = id;
      panel.classList.add('panel');
      return panel;
    }
    const settingsPanel = createPanel('settings-panel');
    const controlsPanel = createPanel('controls-panel');

    const modelSelector = document.createElement('select') as HTMLSelectElement;
    const colorSelector = document.createElement('select') as HTMLSelectElement;
    const animationSelector = document.createElement('select') as HTMLSelectElement;

    if (!animations.length) {
      animationSelector.disabled = true;
    }

    function makeSelectOptions(selectElement: HTMLSelectElement, data: Array<string>, text?: string) {
      for (let i = 0; i < data.length; i++) {
        var option = document.createElement("option");
        option.value = data[i];
        option.text = text ? text + i++ : data[i];
        selectElement.appendChild(option);
      }
    }

    makeSelectOptions(colorSelector, colors);
    makeSelectOptions(modelSelector, models);
    makeSelectOptions(animationSelector, Array.from({ length: this.animations.length }, (_, i) => String(i++)));

    colorSelector.value = this.currentColor;
    modelSelector.value = this.currentModel;

    modelSelector.addEventListener('change', (event: Event) => {
      this.clearScene();
      const target = event.target as HTMLSelectElement;
      this.loadModel(target.value);
    });

    colorSelector.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLSelectElement;
      this.changeColor(target.value);
    });

    animationSelector.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLSelectElement;
      this.currentAnimation = this.animations[Number(target.value)];
    });

    const controlsConfig = ['moveLeft', 'moveRight', 'moveBackward', 'moveForward'];

    controlsConfig.forEach(item => {
      const controlButton = document.createElement('button');
      controlButton.id = item;
      controlButton.innerHTML = item;
      controlsPanel.appendChild(controlButton);
    })

    settingsPanel.appendChild(modelSelector);
    settingsPanel.appendChild(colorSelector);
    settingsPanel.appendChild(animationSelector);

    this.container.appendChild(settingsPanel);
    this.container.appendChild(controlsPanel);

    document.getElementById('moveForward')?.addEventListener('click', () => {
      this.camera.position.z -= 0.5;
    });

    document.getElementById('moveBackward')?.addEventListener('click', () => {
      this.camera.position.z += 0.5;
    });

    document.getElementById('moveLeft')?.addEventListener('click', () => {
      this.camera.position.x -= 0.5;
    });

    document.getElementById('moveRight')?.addEventListener('click', () => {
      this.camera.position.x += 0.5;
    });
  }

  private changeColor(color: string) {
    const newMaterial = new THREE.MeshBasicMaterial({ color });

    this.scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = newMaterial;
      }
    });
  }

  private animate() {
    const animate = () => {
      requestAnimationFrame(animate);

      if (this.currentAnimation) {
        this.mixer.clipAction(this.currentAnimation).play();
        const clock = new THREE.Clock();
        this.mixer.update(clock.getDelta());
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private clearScene() {
    this.scene.remove(this.scene.children[0]);
  }

  public dispose() {
    // Dispose resources
    // Not implemented for simplicity
    // TODO: delete all the DOM nodes with their event listeners. Just don't have enough free time C:
  }
}
