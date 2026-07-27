import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const TAU = Math.PI * 2
const plotPos = [[-5,-4.5],[5,-4.5],[-5,0],[5,0],[-5,4.5],[5,4.5]]

function genTex(size) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const ctx = cv.getContext('2d')
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    ctx.fillStyle = `hsl(${80 + (Math.random()-.5)*20}, ${40 + (Math.random()-.5)*20}%, ${25 + (Math.random()-.5)*10}%)`
    ctx.fillRect(x, y, 1, 1)
  }
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

export default function FarmScene3D({ zones, selectedZoneId, patrolling, onSelectZone }) {
  const mountRef = useRef(null)
  const sceneData = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    if (sceneData.current) return // 已初始化，跳过

    try {
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x889eba)
      scene.fog = new THREE.FogExp2(0x889eba, 0.00035)

      const cam = new THREE.PerspectiveCamera(48, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.5, 200)
      cam.position.set(14, 11, 16)
      cam.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      renderer.outputColorSpace = THREE.SRGBColorSpace
      mount.appendChild(renderer.domElement)

      const controls = new OrbitControls(cam, renderer.domElement)
      controls.target.set(0, 0.3, 0)
      controls.enableDamping = true; controls.dampingFactor = 0.08
      controls.minDistance = 6; controls.maxDistance = 40
      controls.maxPolarAngle = Math.PI * 0.47
      controls.update()

      // 灯光
      scene.add(new THREE.AmbientLight(0x94a690, 0.6))
      scene.add(new THREE.HemisphereLight(0xfff0dd, 0x3a4a28, 0.45))
      const sun = new THREE.DirectionalLight(0xfff6e0, 4)
      sun.position.set(40, 50, -10)
      sun.castShadow = true
      sun.shadow.mapSize.set(2048, 2048)
      sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 150
      sun.shadow.camera.left = -35; sun.shadow.camera.right = 35
      sun.shadow.camera.top = 35; sun.shadow.camera.bottom = -35
      sun.shadow.bias = -0.00025
      scene.add(sun)

      // 地面
      const grassTex = genTex(512); grassTex.repeat.set(4, 4)
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.92 }))
      ground.rotation.x = -Math.PI / 2; ground.position.y = -0.15; ground.receiveShadow = true
      scene.add(ground)

      const farmArea = new THREE.Mesh(new THREE.PlaneGeometry(32, 22), new THREE.MeshStandardMaterial({ color: 0x587040, roughness: 0.88 }))
      farmArea.rotation.x = -Math.PI / 2; farmArea.position.y = -0.04; farmArea.receiveShadow = true
      scene.add(farmArea)

      // 田块 + 作物
      const clickables = []
      const fieldMeshes = []
      zones.forEach((zone, idx) => {
        const [fx, fz] = plotPos[idx]
        const fw = 4.5, fd = 3.5
        const rc = zone.risk >= 70 ? 0xc66f50 : zone.risk >= 50 ? 0xd89c53 : zone.risk >= 30 ? 0xb9ae61 : 0x6f9867

        const fMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(fw, fd),
          new THREE.MeshStandardMaterial({ color: rc, roughness: 0.86 })
        )
        fMesh.rotation.x = -Math.PI / 2; fMesh.position.set(fx, 0.01, fz); fMesh.receiveShadow = true
        fMesh.userData = { zoneId: zone.id, fx, fz, fw, fd }
        clickables.push(fMesh)
        fieldMeshes.push(fMesh)
        scene.add(fMesh)

        // 选中环
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.06, 8, 48), new THREE.MeshBasicMaterial({ color: 0xdced6c, transparent: true, opacity: 0.85 }))
        ring.rotation.x = -Math.PI / 2; ring.position.set(fx, 0.06, fz)
        ring.visible = zone.id === selectedZoneId
        ring.userData = { zoneId: zone.id }
        scene.add(ring)

        // 简单作物
        for (let r = -1; r <= 1; r++) for (let c = -2; c <= 2; c++) {
          const h = 0.5 + Math.random()
          const crop = new THREE.Group()
          crop.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, h * 0.5, 6), new THREE.MeshStandardMaterial({ color: 0x3d6d28 }))).position.y = h * 0.25
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(h * 0.25, 6), new THREE.MeshStandardMaterial({ color: 0x4caf50 }))
          leaf.position.y = h * 0.55; leaf.scale.set(1, 0.55, 1); crop.add(leaf)
          crop.position.set(fx + c * 0.55, 0, fz + r * 0.55)
          scene.add(crop)
        }
      })

      // 田埂
      const ridgeMat = new THREE.MeshStandardMaterial({ color: 0xbfa880, roughness: 0.52 })
      ;[-3.2, 3.2].forEach(x => { const r = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 25), ridgeMat); r.position.set(x, 0.07, 0); r.castShadow = r.receiveShadow = true; scene.add(r) })
      ;[-7.2, 7.2].forEach(z => { const r = new THREE.Mesh(new THREE.BoxGeometry(13, 0.15, 0.35), ridgeMat); r.position.set(0, 0.07, z); r.castShadow = r.receiveShadow = true; scene.add(r) })

      // 阡陌
      ;[-3.2, 3.2].forEach(x => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 25), new THREE.MeshStandardMaterial({ color: 0x9e8c70, roughness: 0.9 })); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.015, 0); scene.add(p) })

      // 水渠
      const water = new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.06, metalness: 0.7 })
      ;[-3.2, 3.2].forEach(x => { const wm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 25), water); wm.position.set(x, 0.06, 0); scene.add(wm) })

      // 栅栏
      const postGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.8, 6)
      const postMat = new THREE.MeshStandardMaterial({ color: 0xb89868, roughness: 0.55 })
      for (let x = -7.5; x <= 7.5; x += 1) { [-7.5, 7.5].forEach(z => { const p = new THREE.Mesh(postGeo, postMat); p.position.set(x, 0.38, z); p.castShadow = true; scene.add(p) }) }
      for (let z = -6.5; z <= 6.5; z += 1) { [-7.5, 7.5].forEach(x => { const p = new THREE.Mesh(postGeo, postMat); p.position.set(x, 0.38, z); p.castShadow = true; scene.add(p) }) }

      // 树木
      ;[[-9,8.5],[9,8.5],[-9,-8.5],[9,-8.5],[-10,0],[10,0],[0,9],[0,-9]].forEach(([tx, tz]) => {
        const tg = new THREE.Group()
        const th = 2 + Math.random() * 2
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, th * 0.42, 8), new THREE.MeshStandardMaterial({ color: 0x6b4a2a }))
        trunk.position.y = th * 0.21; tg.add(trunk)
        for (let i = 0; i < 3; i++) {
          const foliage = new THREE.Mesh(new THREE.SphereGeometry(th * 0.35, 7, 5), new THREE.MeshStandardMaterial({ color: 0x2d6a1e }))
          foliage.position.y = th * 0.42 + i * th * 0.2
          foliage.scale.set(1 - i * 0.15, 0.6, 1 - i * 0.15); tg.add(foliage)
        }
        tg.position.set(tx, 0, tz); scene.add(tg)
      })

      // 小屋
      const house = new THREE.Group()
      house.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.6, 2.0), new THREE.MeshStandardMaterial({ color: 0xf0e6d0, roughness: 0.55 }))).position.y = 0.8
      const shape = new THREE.Shape(); shape.moveTo(-1.6, 0); shape.lineTo(0, 1.1); shape.lineTo(1.6, 0); shape.closePath()
      house.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { steps: 1, depth: 2.4, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x9a3a20, roughness: 0.5 }))).position.set(-1.6, 1.6, -1.2)
      house.position.set(9, 0, 8.5); house.rotation.y = -0.5
      scene.add(house)

      // 巡逻机器人（简化版）
      const robot = mkRobot()
      const route = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5, 0.12, -7.5), new THREE.Vector3(5, 0.12, -7.5),
        new THREE.Vector3(5, 0.12, 0), new THREE.Vector3(-5, 0.12, 0),
        new THREE.Vector3(-5, 0.12, 7.5), new THREE.Vector3(5, 0.12, 7.5),
      ])
      const routeLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(route.getPoints(100)), new THREE.LineDashedMaterial({ color: 0xf2e7aa, dashSize: 0.22, gapSize: 0.15, transparent: true, opacity: 0.7 }))
      routeLine.computeLineDistances()
      scene.add(routeLine)
      scene.add(robot)

      // 点击
      const raycaster = new THREE.Raycaster()
      const pointer = new THREE.Vector2()
      const onPointer = (e) => {
        const rect = renderer.domElement.getBoundingClientRect()
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(pointer, cam)
        const hit = raycaster.intersectObjects(clickables, false)[0]
        if (hit) onSelectZone(hit.object.userData.zoneId)
      }
      renderer.domElement.addEventListener('pointerdown', onPointer)

      // 尺寸
      const resize = () => {
        const w = Math.max(1, mount.clientWidth), h = Math.max(1, mount.clientHeight)
        renderer.setSize(w, h, false)
        cam.aspect = w / h; cam.updateProjectionMatrix()
      }
      const obs = new ResizeObserver(resize)
      obs.observe(mount)
      resize()

      // 动画
      let elapsed = 0
      const animate = () => {
        elapsed += 0.003
        if (patrolling) {
          const p = route.getPoint(elapsed % 1)
          const a = route.getPoint((elapsed + 0.004) % 1)
          robot.position.copy(p)
          robot.lookAt(a.x, p.y, a.z)
        }
        controls.update()
        renderer.render(scene, cam)
      }
      renderer.setAnimationLoop(animate)

      sceneData.current = {
        scene, cam, renderer, controls, obs, onPointer, animate,
        fieldMeshes, clickables, route, robot, water
      }
    } catch (err) {
      console.error('FarmScene3D init error:', err)
      mount.innerHTML = `<div style="color:#e53935;padding:20px">3D场景初始化失败<br/><small>${err.message}</small></div>`
      return
    }

    return () => {
      const sd = sceneData.current
      if (!sd) return
      sd.renderer.domElement.removeEventListener('pointerdown', sd.onPointer)
      sd.renderer.setAnimationLoop(null)
      sd.obs.disconnect()
      sd.controls.dispose()
      sd.scene.traverse(obj => {
        obj.geometry?.dispose?.()
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
        else obj.material?.dispose?.()
      })
      sd.renderer.dispose()
      sd.renderer.domElement.remove()
      sceneData.current = null
    }
  }, [])

  // props 变化时更新场景
  useEffect(() => {
    const sd = sceneData.current
    if (!sd) return
    // 更新田块颜色 + 选中环
    sd.scene.traverse(obj => {
      if (obj.userData?.zoneId) {
        if (obj.geometry?.type === 'TorusGeometry') {
          obj.visible = obj.userData.zoneId === selectedZoneId
        } else if (obj.userData.fx !== undefined) {
          const zone = zones.find(z => z.id === obj.userData.zoneId)
          if (zone && obj.material.color) {
            const rc = zone.risk >= 70 ? 0xc66f50 : zone.risk >= 50 ? 0xd89c53 : zone.risk >= 30 ? 0xb9ae61 : 0x6f9867
            obj.material.color.set(rc)
          }
        }
      }
    })
  }, [selectedZoneId, zones])

  return <div className="farm-scene-canvas" ref={mountRef} />
}

function mkRobot() {
  const g = new THREE.Group()
  const dark = new THREE.MeshStandardMaterial({ color: 0x344050, roughness: 0.2, metalness: 0.75 })
  const green = new THREE.MeshStandardMaterial({ color: 0x00c853, roughness: 0.15, metalness: 0.5, emissive: 0x003a15, emissiveIntensity: 0.2 })

  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.0), new THREE.MeshStandardMaterial({ color: 0x2a3540, roughness: 0.3 }))).position.y = 0.08
  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.0), dark)).position.y = 0.22

  // 4 麦轮（简化）
  ;[[0.65,0.1,0.45],[-0.65,0.1,0.45],[0.65,0.1,-0.45],[-0.65,0.1,-0.45]].forEach(([x,y,z]) => {
    const wh = new THREE.Group()
    wh.add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.3 }))).rotation.z = Math.PI / 2
    for (let i = 0; i < 8; i++) {
      const ang = i / 8 * TAU
      const rl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 6), new THREE.MeshStandardMaterial({ color: 0xddd, roughness: 0.4 }))
      rl.position.set(Math.cos(ang) * 0.14, Math.sin(ang) * 0.14, 0)
      rl.rotation.z = Math.PI / 4; rl.rotation.x = ang
      wh.add(rl)
    }
    wh.position.set(x, y, z); wh.rotation.z = Math.PI / 2; wh.rotation.y = Math.PI / 2
    g.add(wh)
  })

  // 云台 x2
  ;[0.78, -0.78].forEach((px, i) => {
    const gim = new THREE.Group()
    gim.add(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.08, 16), dark)).position.y = 0.04
    gim.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.14), new THREE.MeshStandardMaterial({ color: 0x111, roughness: 0.1 }))).position.y = 0.22
    gim.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 12), green)).rotation.x = Math.PI / 2; gim.children[gim.children.length - 1].position.set(0, 0.22, 0.09)
    gim.position.set(px, 0.3, 0); if (i) gim.rotation.y = Math.PI
    g.add(gim)
  })

  // GPS
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8), green)).position.set(0.1, 0.42, -0.15)
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }))).position.set(0.1, 0.6, -0.15)

  g.castShadow = true
  return g
}
