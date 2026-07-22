import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const plotPositions = [
  [-4, -2], [0, -2], [4, -2],
  [-4, 2], [0, 2], [4, 2],
]

export default function FarmScene3D({ zones, selectedZoneId, patrolling, onSelectZone }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xdfe8da, 17, 29)

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(11, 9, 13)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute('aria-label', '可旋轉縮放的農田數字孿生場景')
    renderer.domElement.setAttribute('role', 'img')
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enablePan = false
    controls.minDistance = 10
    controls.maxDistance = 24
    controls.maxPolarAngle = Math.PI * 0.47
    controls.target.set(0, 0, 0)

    scene.add(new THREE.HemisphereLight(0xf4f7e9, 0x446254, 2.3))
    const sun = new THREE.DirectionalLight(0xfff4d2, 3.1)
    sun.position.set(-6, 12, 8)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(17, 11),
      new THREE.MeshStandardMaterial({ color: 0x9caf88, roughness: 1 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.24
    ground.receiveShadow = true
    scene.add(ground)

    const grid = new THREE.GridHelper(17, 34, 0x6f896d, 0x91a58a)
    grid.position.y = -0.21
    grid.material.opacity = 0.24
    grid.material.transparent = true
    scene.add(grid)

    const clickablePlots = []
    const plotGroup = new THREE.Group()
    scene.add(plotGroup)

    zones.forEach((zone, index) => {
      const [x, z] = plotPositions[index]
      const riskColor = zone.risk >= 70 ? 0xc66f50 : zone.risk >= 50 ? 0xd89c53 : zone.risk >= 30 ? 0xb9ae61 : 0x6f9867
      const plot = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.2, 2.75),
        new THREE.MeshStandardMaterial({ color: riskColor, roughness: 0.86, metalness: 0.02 }),
      )
      plot.position.set(x, 0, z)
      plot.castShadow = true
      plot.receiveShadow = true
      plot.userData.zoneId = zone.id
      clickablePlots.push(plot)
      plotGroup.add(plot)

      const cropColor = zone.risk >= 70 ? 0x84944d : 0x477c50
      for (let row = -1; row <= 1; row += 1) {
        for (let column = -2; column <= 2; column += 1) {
          const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.035, 0.38, 6),
            new THREE.MeshStandardMaterial({ color: 0x426b3e }),
          )
          stem.position.set(x + column * 0.48, 0.3, z + row * 0.62)
          plotGroup.add(stem)
          const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(0.16, 7, 5),
            new THREE.MeshStandardMaterial({ color: cropColor, roughness: 0.9 }),
          )
          leaf.scale.set(1.45, 0.55, 0.8)
          leaf.rotation.y = (column + row) * 0.5
          leaf.position.set(x + column * 0.48, 0.48, z + row * 0.62)
          leaf.castShadow = true
          plotGroup.add(leaf)
        }
      }

      if (zone.id === selectedZoneId) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(1.9, 2.05, 48),
          new THREE.MeshBasicMaterial({ color: 0xdced6c, transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
        )
        ring.rotation.x = -Math.PI / 2
        ring.position.set(x, 0.13, z)
        ring.userData.selectionRing = true
        plotGroup.add(ring)
      }
    })

    const routeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5.4, 0.12, -4.2), new THREE.Vector3(5.4, 0.12, -4.2),
      new THREE.Vector3(5.4, 0.12, 0), new THREE.Vector3(-5.4, 0.12, 0),
      new THREE.Vector3(-5.4, 0.12, 4.2), new THREE.Vector3(5.4, 0.12, 4.2),
    ])
    const routeLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(routeCurve.getPoints(100)),
      new THREE.LineDashedMaterial({ color: 0xf2e7aa, dashSize: 0.22, gapSize: 0.15, transparent: true, opacity: 0.72 }),
    )
    routeLine.computeLineDistances()
    scene.add(routeLine)

    const robot = createRobot()
    scene.add(robot)

    const sensorPositions = [[-6.7, -4.3], [6.7, -4.3], [-6.7, 4.3], [6.7, 4.3]]
    sensorPositions.forEach(([x, z], index) => scene.add(createSensorTower(x, z, index)))

    const scanRing = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.44, 48),
      new THREE.MeshBasicMaterial({ color: 0x9ee589, transparent: true, opacity: 0.75, side: THREE.DoubleSide }),
    )
    scanRing.rotation.x = -Math.PI / 2
    scanRing.position.y = 0.04
    scene.add(scanRing)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const handlePointer = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(clickablePlots, false)[0]
      if (hit) onSelectZone(hit.object.userData.zoneId)
    }
    renderer.domElement.addEventListener('pointerdown', handlePointer)

    const resize = () => {
      const width = Math.max(1, mount.clientWidth)
      const height = Math.max(1, mount.clientHeight)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    let elapsed = 0
    renderer.setAnimationLoop(() => {
      elapsed += 0.0035
      if (patrolling) {
        const point = routeCurve.getPoint(elapsed % 1)
        const ahead = routeCurve.getPoint((elapsed + 0.005) % 1)
        robot.position.copy(point)
        robot.lookAt(ahead.x, point.y, ahead.z)
      }
      scanRing.position.x = robot.position.x
      scanRing.position.z = robot.position.z
      const pulse = 1 + ((elapsed * 5) % 1) * 2.7
      scanRing.scale.setScalar(pulse)
      scanRing.material.opacity = 0.75 * (1 - ((elapsed * 5) % 1))
      const selectedRing = plotGroup.children.find((item) => item.userData.selectionRing)
      if (selectedRing) selectedRing.rotation.z += 0.004
      controls.update()
      renderer.render(scene, camera)
    })

    return () => {
      observer.disconnect()
      renderer.setAnimationLoop(null)
      renderer.domElement.removeEventListener('pointerdown', handlePointer)
      controls.dispose()
      scene.traverse((object) => {
        object.geometry?.dispose?.()
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
        else object.material?.dispose?.()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [zones, selectedZoneId, patrolling, onSelectZone])

  return <div className="farm-scene-canvas" ref={mountRef}><span className="sr-only">農田分為六個地塊，巡田車沿田間路線移動，感測基站位於四角。</span></div>
}

function createRobot() {
  const group = new THREE.Group()
  const dark = new THREE.MeshStandardMaterial({ color: 0x18372e, roughness: 0.45, metalness: 0.22 })
  const accent = new THREE.MeshStandardMaterial({ color: 0xc8e165, roughness: 0.55 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.58, 0.82), dark)
  body.position.y = 0.62
  body.castShadow = true
  group.add(body)

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.58), dark)
  cabin.position.set(0.25, 1.02, 0)
  cabin.castShadow = true
  group.add(cabin)

  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), accent)
  lens.position.set(0.55, 1.05, 0)
  group.add(lens)

  ;[-0.43, 0.43].forEach((z) => {
    ;[-0.43, 0.43].forEach((x) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 14), new THREE.MeshStandardMaterial({ color: 0x1b2622, roughness: 0.8 }))
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(x, 0.34, z)
      wheel.castShadow = true
      group.add(wheel)
    })
  })

  const armBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.28, 12), accent)
  armBase.position.set(-0.28, 1.12, 0)
  group.add(armBase)
  const armA = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.12), accent)
  armA.position.set(-0.45, 1.4, 0)
  armA.rotation.z = -0.55
  group.add(armA)
  const armB = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.48, 0.1), accent)
  armB.position.set(-0.73, 1.69, 0)
  armB.rotation.z = 0.7
  group.add(armB)
  return group
}

function createSensorTower(x, z, index) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.35, 8), new THREE.MeshStandardMaterial({ color: 0x315b4c }))
  pole.position.y = 0.68
  group.add(pole)
  const node = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.25, 0.28), new THREE.MeshStandardMaterial({ color: 0xe3e9d7, roughness: 0.5 }))
  node.position.y = 1.38
  node.rotation.y = index * 0.5
  group.add(node)
  const beacon = new THREE.PointLight(0xb8e676, 0.8, 2.5)
  beacon.position.y = 1.55
  group.add(beacon)
  return group
}
