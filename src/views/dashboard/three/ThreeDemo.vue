<template>
  <div class="three-demo">
    <div class="three-container" ref="containerRef"></div>
    <div class="three-controls">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card class="control-card">
            <template #header>
              <span>几何体</span>
            </template>
            <el-select v-model="selectedGeometry" @change="changeGeometry" placeholder="选择几何体">
              <el-option label="立方体" value="box"></el-option>
              <el-option label="球体" value="sphere"></el-option>
              <el-option label="圆环" value="torus"></el-option>
              <el-option label="圆锥" value="cone"></el-option>
            </el-select>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="control-card">
            <template #header>
              <span>材质颜色</span>
            </template>
            <el-color-picker v-model="materialColor" @change="changeMaterialColor" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="control-card">
            <template #header>
              <span>旋转速度</span>
            </template>
            <el-slider v-model="rotationSpeed" :min="0" :max="0.05" :step="0.005" @change="changeRotationSpeed" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="control-card">
            <template #header>
              <span>动画控制</span>
            </template>
            <el-button-group>
              <el-button @click="toggleAnimation" :type="isAnimating ? 'success' : 'info'">
                {{ isAnimating ? '暂停' : '播放' }}
              </el-button>
              <el-button @click="resetScene" type="warning">重置</el-button>
            </el-button-group>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as THREE from 'three';

// 响应式变量
const containerRef = ref<HTMLElement>();
const selectedGeometry = ref('box');
const materialColor = ref('#409EFF');
const rotationSpeed = ref(0.01);
const isAnimating = ref(true);

// Three.js 核心对象
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let mesh: THREE.Mesh;
let animationId: number;

// 初始化Three.js场景
const initThreeJS = () => {
  if (!containerRef.value) return;

  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // 创建相机
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  containerRef.value.appendChild(renderer.domElement);

  // 添加光照
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // 创建初始几何体
  createGeometry();

  // 添加地面
  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -2;
  plane.receiveShadow = true;
  scene.add(plane);

  // 开始动画循环
  animate();
};

// 创建几何体
const createGeometry = () => {
  // 移除旧的几何体
  if (mesh) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material: THREE.Material) => material.dispose());
    } else {
      (mesh.material as THREE.Material).dispose();
    }
  }

  let geometry: THREE.BufferGeometry;
  
  switch (selectedGeometry.value) {
    case 'sphere':
      geometry = new THREE.SphereGeometry(1, 32, 32);
      break;
    case 'torus':
      geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
      break;
    case 'cone':
      geometry = new THREE.ConeGeometry(1, 2, 32);
      break;
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  const material = new THREE.MeshPhongMaterial({ 
    color: materialColor.value,
    shininess: 100,
    specular: 0x111111
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
};

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate);
  
  if (isAnimating.value && mesh) {
    mesh.rotation.x += rotationSpeed.value;
    mesh.rotation.y += rotationSpeed.value;
  }

  renderer.render(scene, camera);
};

// 更改几何体
const changeGeometry = () => {
  createGeometry();
};

// 更改材质颜色
const changeMaterialColor = () => {
  if (mesh && mesh.material instanceof THREE.MeshPhongMaterial) {
    mesh.material.color.setStyle(materialColor.value);
  }
};

// 更改旋转速度
const changeRotationSpeed = () => {
  // 速度已经通过v-model绑定更新了
};

// 切换动画
const toggleAnimation = () => {
  isAnimating.value = !isAnimating.value;
};

// 重置场景
const resetScene = () => {
  if (mesh) {
    mesh.rotation.x = 0;
    mesh.rotation.y = 0;
    mesh.position.set(0, 0, 0);
  }
  selectedGeometry.value = 'box';
  materialColor.value = '#409EFF';
  rotationSpeed.value = 0.01;
  isAnimating.value = true;
  createGeometry();
};

// 处理窗口大小调整
const handleResize = () => {
  if (!containerRef.value || !renderer || !camera) return;
  
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// 生命周期
onMounted(() => {
  nextTick(() => {
    initThreeJS();
    window.addEventListener('resize', handleResize);
  });
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  if (renderer) {
    renderer.dispose();
  }
  
  if (mesh) {
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material: THREE.Material) => material.dispose());
      } else {
        (mesh.material as THREE.Material).dispose();
      }
    }
  }
  
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="less" scoped>
.three-demo {
  width: 100%;
  height: 100%;
  
  .three-container {
    width: 100%;
    height: 400px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-light);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .three-controls {
    .control-card {
      border-radius: 8px;
      border: none;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      
      :deep(.el-card__header) {
        padding: 12px 16px;
        background: var(--el-color-primary-light-9);
        
        span {
          font-weight: 600;
          color: var(--el-text-color-primary);
          font-size: 14px;
        }
      }
      
      :deep(.el-card__body) {
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .el-select {
          width: 100%;
        }
        
        .el-slider {
          width: 100%;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .three-demo {
    .three-container {
      height: 300px;
    }
    
    .three-controls {
      .el-col {
        margin-bottom: 12px;
      }
    }
  }
}
</style>
