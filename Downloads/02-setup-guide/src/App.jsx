import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function App() {
  const [selectedColor, setSelectedColor] = useState('#2196f3');
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.2);
  const [edgeColor, setEdgeColor] = useState('#000000');
  const [finish, setFinish] = useState('glossy');
  const [selectedScene, setSelectedScene] = useState('studio');
  const [opacity, setOpacity] = useState(1);
  const [reliefHeight, setReliefHeight] = useState(0);
  const [hotFoilColor, setHotFoilColor] = useState('#FFD700');
  const [grainSize, setGrainSize] = useState(0.5);

  // State for textures
  const [colorMap, setColorMap] = useState(null);
  const [normalMap, setNormalMap] = useState(null);
  const [roughnessMap, setRoughnessMap] = useState(null);
  const [metalnessMap, setMetalnessMap] = useState(null);

  useEffect(() => {
    let cardMesh, material, scene, camera, renderer, controls;

    // Canvas setup
    const canvas = document.getElementById('myThreeJsCanvas');
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    renderer.setSize(window.innerWidth * 0.7, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
      50,
      (window.innerWidth * 0.7) / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 200;

    // Card dimensions
    const cardWidth = 85.6;
    const cardHeight = 53.98;
    const cardThickness = 0.76;
    const cornerRadius = 3.48;

    // Create card shape
    const shape = new THREE.Shape();
    const x = -cardWidth / 2;
    const y = -cardHeight / 2;
    
    shape.moveTo(x + cornerRadius, y);
    shape.lineTo(x + cardWidth - cornerRadius, y);
    shape.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + cornerRadius);
    shape.lineTo(x + cardWidth, y + cardHeight - cornerRadius);
    shape.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - cornerRadius, y + cardHeight);
    shape.lineTo(x + cornerRadius, y + cardHeight);
    shape.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - cornerRadius);
    shape.lineTo(x, y + cornerRadius);
    shape.quadraticCurveTo(x, y, x + cornerRadius, y);

    const extrudeSettings = {
      steps: 1,
      depth: cardThickness,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.2,
      bevelOffset: 0,
      bevelSegments: 3
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Texture loader
    const textureLoader = new THREE.TextureLoader();

    // Create material with advanced properties
    material = new THREE.MeshPhysicalMaterial({
      color: selectedColor,
      metalness: metalness,
      roughness: roughness,
      transparent: true,
      opacity: opacity,
      clearcoat: finish === 'glossy' ? 1 : 0,
      clearcoatRoughness: finish === 'glossy' ? 0.1 : 0.5,
      side: THREE.DoubleSide,
      map: colorMap, // Color map
      normalMap: normalMap, // Normal map
      roughnessMap: roughnessMap, // Roughness map
      metalnessMap: metalnessMap, // Metalness map
    });

    cardMesh = new THREE.Mesh(geometry, material);
    scene.add(cardMesh);

    // Lighting setups
    const setupLighting = (sceneType) => {
      // Remove existing lights
      scene.children = scene.children.filter(child => !(child instanceof THREE.Light));

      switch(sceneType) {
        case 'studio':
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(ambientLight);
          
          const mainLight = new THREE.DirectionalLight(0xffffff, 1);
          mainLight.position.set(1, 1, 1);
          scene.add(mainLight);
          
          const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
          fillLight.position.set(-1, -1, 1);
          scene.add(fillLight);
          break;

        case 'outdoor':
          const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
          sunLight.position.set(5, 5, 5);
          scene.add(sunLight);
          
          const skyLight = new THREE.HemisphereLight(0x87ceeb, 0x404040, 1);
          scene.add(skyLight);
          break;

        case 'dramatic':
          const spotLight = new THREE.SpotLight(0xffffff, 2);
          spotLight.position.set(3, 3, 3);
          spotLight.angle = Math.PI / 6;
          scene.add(spotLight);
          
          const rimLight = new THREE.DirectionalLight(0x404040, 0.5);
          rimLight.position.set(-2, -2, -2);
          scene.add(rimLight);
          break;
      }
    };

    setupLighting(selectedScene);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controls.enableZoom = true;
    controls.minDistance = 100;
    controls.maxDistance = 500;

    // Handle window resize
    const handleResize = () => {
      camera.aspect = (window.innerWidth * 0.7) / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth * 0.7, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Update material properties based on state changes
    const updateMaterial = () => {
      if (material) {
        material.color.setStyle(selectedColor);
        material.metalness = metalness;
        material.roughness = roughness;
        material.opacity = opacity;
        material.clearcoat = finish === 'glossy' ? 1 : 0;
        material.clearcoatRoughness = finish === 'glossy' ? 0.1 : 0.5;
        material.map = colorMap;
        material.normalMap = normalMap;
        material.roughnessMap = roughnessMap;
        material.metalnessMap = metalnessMap;
        material.needsUpdate = true;
      }
    };

    // Watch for state changes and update material
    updateMaterial();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [selectedColor, metalness, roughness, edgeColor, finish, selectedScene, opacity, reliefHeight, hotFoilColor, grainSize, colorMap, normalMap, roughnessMap, metalnessMap]);

  // Handle texture uploads
  const handleUpload = (event, mapType) => {
    const file = event.target.files[0];
    if (file) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(URL.createObjectURL(file), (texture) => {
        switch (mapType) {
          case 'color':
            setColorMap(texture);
            break;
          case 'normal':
            setNormalMap(texture);
            break;
          case 'roughness':
            setRoughnessMap(texture);
            break;
          case 'metalness':
            setMetalnessMap(texture);
            break;
          default:
            break;
        }
      });
    }
  };

  return (
    <div className="flex">
      {/* 3D Viewer */}
      <div className="w-[70%] h-screen">
        <canvas id="myThreeJsCanvas" />
      </div>

      {/* Control Panel */}
      <div className="w-[30%] h-screen bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Card Configurator</h2>
        
        {/* Basic Properties */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Basic Properties</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Card Color</label>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Edge Color</label>
              <input
                type="color"
                value={edgeColor}
                onChange={(e) => setEdgeColor(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Material Properties */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Material Properties</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Metalness: {metalness}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={metalness}
                onChange={(e) => setMetalness(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Roughness: {roughness}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={roughness}
                onChange={(e) => setRoughness(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Transparency: {opacity}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Finish Options */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Card Finish</h3>
          <select
            value={finish}
            onChange={(e) => setFinish(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="glossy">Glossy</option>
            <option value="matte">Matte</option>
          </select>
        </div>

        {/* Lighting Scenes */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Lighting Scene</h3>
          <select
            value={selectedScene}
            onChange={(e) => setSelectedScene(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="studio">Studio</option>
            <option value="outdoor">Outdoor</option>
            <option value="dramatic">Dramatic</option>
          </select>
        </div>

        {/* Special Effects */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Special Effects</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Relief Height: {reliefHeight}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={reliefHeight}
                onChange={(e) => setReliefHeight(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Hot Foil Color</label>
              <input
                type="color"
                value={hotFoilColor}
                onChange={(e) => setHotFoilColor(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Grain Size: {grainSize}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={grainSize}
                onChange={(e) => setGrainSize(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Map Upload Buttons */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Texture Maps</h3>
          <div className="space-y-2">
            <h1>Color map</h1>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'color')}
              className="w-full p-2 border rounded"
            />
             <h1>Normal map</h1>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'normal')}
              className="w-full p-2 border rounded"
            />
        <h1>Roughness</h1>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'roughness')}
              className="w-full p-2 border rounded"
            />
                         <h1>Metalness</h1>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'metalness')}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
