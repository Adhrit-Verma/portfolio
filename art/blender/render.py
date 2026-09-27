"""
Procedural 3D "artifacts" — one per project, each a literal model of what the
project does, not generic tech decoration.

    blender -b -P art/blender/render.py -- <slug> <out.png>

Slugs: jimmy contrast clauseguard tablefox gdc tasx
Renders on a transparent film; art/blender/post.py adds bloom and writes webp.
Palette is design-system.md §1 — void/panel hull, DedSec orange, ctOS cyan.
"""

import math
import random
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :]
SLUG, OUT = argv[0], argv[1]
random.seed(7)


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1]


VOID, PANEL, PANEL_HI, LINE_HOT = "#0E0C0B", "#15120F", "#1C1815", "#3F3833"
SIGNAL, SIGNAL_SOFT, SCAN, INK = "#FF6B1A", "#FF9552", "#4FE3D6", "#EDE9E3"

# ---------------------------------------------------------------- scene setup

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

scene = bpy.context.scene
for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        scene.render.engine = engine
        break
    except TypeError:
        pass
scene.eevee.taa_render_samples = 64
scene.render.resolution_x, scene.render.resolution_y = 1600, 1000
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"
scene.render.filepath = OUT

world = bpy.data.worlds.new("w") if not scene.world else scene.world
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = srgb("#1a1614")
bg.inputs["Strength"].default_value = 0.6

_mats = {}


def mat(name, color, emit=0.0, rough=0.55, metal=0.0, alpha=1.0):
    key = (name, color, emit, alpha)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = srgb(color)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if emit:
        # Standard view: strength ~1 keeps the exact token hue; anything hotter
        # clips orange to yellow. The glow is added in post.py instead.
        p.inputs["Emission Color"].default_value = srgb(color)
        p.inputs["Emission Strength"].default_value = min(emit * 0.28, 1.3)
    if alpha < 1:
        p.inputs["Alpha"].default_value = alpha
        try:
            m.surface_render_method = "BLENDED"
        except AttributeError:
            m.blend_method = "BLEND"
    _mats[key] = m
    return m


HULL = lambda: mat("hull", PANEL_HI, rough=0.45, metal=0.3)
HOT = lambda s=4.0: mat("hot", SIGNAL, emit=s)
COOL = lambda s=3.0: mat("cool", SCAN, emit=s)


def assign(o, m):
    o.data.materials.clear()
    o.data.materials.append(m)
    return o


def cube(loc, scale, m, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.object
    o.scale = scale
    if bevel:
        mod = o.modifiers.new("b", "BEVEL")
        mod.width = bevel
        mod.segments = 2
    return assign(o, m)


def cyl(loc, r, depth, m, rot=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    return assign(bpy.context.object, m)


def edges(o, m, thick=0.012):
    """ctOS wire: a duplicate carrying a Wireframe modifier and an emissive material."""
    d = o.copy()
    d.data = o.data.copy()
    bpy.context.collection.objects.link(d)
    mod = d.modifiers.new("w", "WIREFRAME")
    mod.thickness = thick
    mod.use_replace = True
    return assign(d, m)


def tube(a, b, r, m):
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=r, depth=d.length, location=(a + b) / 2)
    o = bpy.context.object
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = d.to_track_quat("Z", "Y")
    return assign(o, m)


def sphere(loc, r, m, sub=3):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=r, location=loc)
    bpy.ops.object.shade_smooth()
    return assign(bpy.context.object, m)


def light(loc, color, energy, size=4):
    bpy.ops.object.light_add(type="AREA", location=loc)
    lt = bpy.context.object
    lt.data.color = srgb(color)[:3]
    lt.data.energy = energy
    lt.data.size = size
    lt.rotation_mode = "QUATERNION"
    lt.rotation_quaternion = (-Vector(loc)).to_track_quat("-Z", "Y")


def camera(loc, target=(0, 0, 0), lens=70):
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.object
    cam.data.lens = lens
    cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y")
    scene.camera = cam


def base_rig():
    light((6, -6, 8), "#ffd9c0", 900)
    light((-7, 3, 4), SCAN, 350, 6)
    light((0, 8, 6), SIGNAL, 250, 6)


# -------------------------------------------------------------------- artifacts


def gdc():
    """A version-1 symbol where every data module is extruded by its gray level.
    That is the whole idea of GDC: modules hold levels, not bits."""
    n, s = 21, 0.2

    def finder(x, y):
        for ox, oy in ((0, 0), (n - 7, 0), (0, n - 7)):
            dx, dy = x - ox, y - oy
            if 0 <= dx < 7 and 0 <= dy < 7:
                ring = max(abs(dx - 3), abs(dy - 3))
                return ring != 2  # 7x7 ring, gap, 3x3 core
        return None

    off = (n - 1) * s / 2
    for x in range(n):
        for y in range(n):
            f = finder(x, y)
            px, py = x * s - off, y * s - off
            if f is not None:
                if f:
                    cube((px, py, 0.06), (s * 0.46, s * 0.46, 0.06), COOL(2.2))
                continue
            if x == 6 or y == 6:  # timing lines
                if (x + y) % 2 == 0:
                    cube((px, py, 0.05), (s * 0.46, s * 0.46, 0.05), mat("ink", INK, emit=0.6))
                continue
            level = random.randint(0, 3)  # 4 gray levels = 2 bits per module
            h = 0.04 + level * 0.09
            m = [HULL(), mat("l1", "#6b3a1f", emit=0.4), mat("l2", SIGNAL_SOFT, emit=1.6), HOT(3.5)][level]
            cube((px, py, h), (s * 0.44, s * 0.44, h), m)
    base_rig()
    camera((5.6, -6.8, 6.4), (0, 0.1, 0.1), lens=45)


def tablefox():
    """The schema as a graph. Retrieval lights the few tables a question needs;
    the rest stay dark — that is the 29% of tokens never sent."""
    pos = [(-2.6, -0.4), (-1.4, 1.3), (-1.2, -1.6), (0, 0), (0.3, 1.9), (1.4, -1.2),
           (1.6, 0.9), (2.8, -0.2), (-0.4, -2.8), (2.6, 2.2), (-2.8, 1.9), (0.9, -2.9)]
    edges_ = [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4), (3, 5), (3, 6), (5, 7), (6, 7),
              (2, 8), (6, 9), (1, 10), (5, 11), (4, 9)]
    hot = {3, 5, 7}
    for i, (x, y) in enumerate(pos):
        on = i in hot
        for k in range(3):
            c = cyl((x, y, 0.22 + k * 0.34), 0.42, 0.26, HOT(3.0) if on and k == 2 else HULL())
            if not on:
                edges(c, mat("wire", LINE_HOT, emit=0.8), 0.008)
        if on:
            shell = cyl((x, y, 0.56), 0.5, 1.12, HULL(), verts=16)
            edges(shell, COOL(3), 0.012)
            bpy.data.objects.remove(shell, do_unlink=True)
    for a, b in edges_:
        on = a in hot and b in hot
        pa, pb = pos[a], pos[b]
        tube((pa[0], pa[1], 0.4), (pb[0], pb[1], 0.4), 0.035 if on else 0.02,
             HOT(5) if on else mat("edge", LINE_HOT, emit=0.5))
    base_rig()
    camera((7.0, -9.2, 8.2), (0.1, -0.2, 0.3), lens=46)


def contrast():
    """A page under the lens: the scan plane crosses it, measured findings are
    flagged orange, verified fixes sit cyan."""
    for k, z in enumerate((0, 0.5, 1.0)):
        page = cube((k * 0.35 - 0.35, k * 0.25, z), (2.2, 1.5, 0.04), HULL(), bevel=0.02)
        edges(page, mat("wire", LINE_HOT, emit=0.7), 0.008)
    top = 1.06
    blocks = [(-1.4, 0.9, 1.2, 0.18), (-1.4, 0.4, 0.8, 0.28), (0.3, 0.4, 0.7, 0.28),
              (-1.4, -0.3, 1.9, 0.12), (-1.4, -0.65, 1.5, 0.12), (-1.4, -1.0, 0.5, 0.2)]
    for i, (x, y, w, h) in enumerate(blocks):
        m = HOT(3.2) if i in (1, 4) else (COOL(2.2) if i == 2 else mat("ui", "#2a2420"))
        cube((x + w + 0.35, y + 0.5, top + 0.03), (w, h, 0.03), m)
    # scan plane
    plane = cube((0.35, 0.2, top + 0.45), (2.4, 0.02, 0.45), mat("sweep", SCAN, emit=2.0, alpha=0.35))
    plane.rotation_euler = (0, 0, 0)
    # the lens
    bpy.ops.mesh.primitive_torus_add(location=(1.6, 1.3, 2.2), major_radius=0.7, minor_radius=0.06,
                                     rotation=(math.radians(62), 0, math.radians(25)))
    assign(bpy.context.object, HOT(4))
    bpy.ops.mesh.primitive_torus_add(location=(1.6, 1.3, 2.2), major_radius=0.55, minor_radius=0.015,
                                     rotation=(math.radians(62), 0, math.radians(25)))
    assign(bpy.context.object, COOL(3))
    base_rig()
    camera((6.2, -7.4, 7.2), (0.4, 0.4, 1.1), lens=44)


def clauseguard():
    """A contract split into clauses, passed through three agents. One clause is
    flagged — the verdict comes from it."""
    for i in range(9):
        w = random.uniform(0.9, 1.5)
        m = HOT(3.5) if i == 3 else HULL()
        c = cube((-2.4, 1.6 - i * 0.38, 0.1 + i * 0.02), (w, 0.13, 0.04), m, bevel=0.01)
        if i != 3:
            edges(c, mat("wire", LINE_HOT, emit=0.7), 0.006)
    nodes = [(-0.1, 0.4, 0.6), (1.3, -0.4, 0.9), (2.7, 0.3, 0.6)]
    for i, p in enumerate(nodes):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.42, location=p)
        o = assign(bpy.context.object, HULL())
        edges(o, COOL(3), 0.02)
        sphere(p, 0.12, HOT(6) if i == 1 else COOL(4))
    tube((-1.0, 0.4, 0.3), nodes[0], 0.025, COOL(3))
    for a, b in zip(nodes, nodes[1:]):
        tube(a, b, 0.03, HOT(4))
    # verdict slab
    v = cube((2.7, -1.6, 0.25), (0.8, 0.45, 0.06), HULL(), bevel=0.02)
    edges(v, HOT(4), 0.015)
    tube(nodes[2], (2.7, -1.6, 0.3), 0.02, HOT(3))
    base_rig()
    camera((3.8, -8.4, 7.0), (0.2, -0.3, 0.3), lens=42)


def jimmy():
    """A day as a strip of blurred moments receding in depth, and the one
    listening pill that answers from them."""
    frames = []
    for i in range(9):
        a = (i - 4) * 0.3
        x, y, z = math.sin(a) * 3.6, 1.6 - math.cos(a) * 1.4, 1.5 + (i % 2) * 0.55
        frames.append((x, y, z))
        f = cube((x, y, z), (0.5, 0.02, 0.32), mat("frame", "#4a3a30", emit=1.6), bevel=0.01)
        f.rotation_euler = (0, 0, a)
        edges(f, HOT(3) if i in (2, 6) else mat("wire", LINE_HOT, emit=0.9), 0.01)
        if i in (2, 6):
            g = cube((x, y - 0.03, z), (0.42, 0.005, 0.25), mat("glowshot", SIGNAL_SOFT, emit=1.2))
            g.rotation_euler = (0, 0, a)
    # the pill
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.26, depth=1.0, location=(0.6, -1.4, 2.2),
                                        rotation=(0, math.radians(90), 0))
    pill = assign(bpy.context.object, mat("pill", VOID, rough=0.3))
    for dx in (-0.5, 0.5):
        sphere((0.6 + dx, -1.4, 2.2), 0.26, mat("pill", VOID, rough=0.3))
    sphere((0.2, -1.66, 2.2), 0.07, COOL(6))
    bpy.ops.mesh.primitive_torus_add(location=(0.6, -1.4, 2.2), major_radius=0.27, minor_radius=0.02,
                                     rotation=(0, math.radians(90), 0))
    assign(bpy.context.object, HOT(4))
    # voice rings
    for k in range(3):
        bpy.ops.mesh.primitive_torus_add(location=(0.6, -1.4, 2.2), major_radius=0.8 + k * 0.38,
                                         minor_radius=0.012, rotation=(math.radians(90), 0, 0))
        assign(bpy.context.object, COOL(3 - k * 0.8))
    # evidence beams from the two matched moments
    for i in (2, 6):
        tube(frames[i], (0.6, -1.4, 2.2), 0.012, HOT(4))
    base_rig()
    camera((2.2, -9.0, 7.4), (0.2, 0.3, 1.6), lens=42)


def tasx():
    """User agent, builder agent, and the sandbox cage between them where a new
    skill is assembled before it may enter the registry."""
    ua = cube((-2.3, 0, 0.6), (0.55, 0.55, 0.55), HULL(), bevel=0.04)
    edges(ua, HOT(4), 0.02)
    ba = cube((2.3, 0, 0.6), (0.55, 0.55, 0.55), HULL(), bevel=0.04)
    edges(ba, COOL(4), 0.02)
    cage = cube((0, 0.2, 0.7), (0.8, 0.8, 0.7), HULL())
    edges(cage, COOL(2.5), 0.012)
    bpy.data.objects.remove(cage, do_unlink=True)
    for x in range(3):
        for y in range(3):
            for z in range(3):
                if random.random() < 0.7:
                    cube((-0.3 + x * 0.3, -0.1 + y * 0.3, 0.35 + z * 0.3), (0.12, 0.12, 0.12),
                         HOT(3) if z == 2 and random.random() < 0.5 else HULL())
    tube((-1.75, 0, 0.6), (-0.8, 0.2, 0.7), 0.025, HOT(3))
    tube((1.75, 0, 0.6), (0.8, 0.2, 0.7), 0.025, COOL(3))
    # registry shelf
    for i in range(5):
        c = cube((-1.6 + i * 0.8, 2.3, 0.2), (0.22, 0.22, 0.2), HULL(), bevel=0.02)
        edges(c, HOT(2.5) if i < 3 else mat("wire", LINE_HOT, emit=0.8), 0.01)
    base_rig()
    camera((5.0, -8.2, 6.0), (0, 0.7, 0.5), lens=42)


{"gdc": gdc, "tablefox": tablefox, "contrast": contrast, "clauseguard": clauseguard,
 "jimmy": jimmy, "tasx": tasx}[SLUG]()
bpy.ops.render.render(write_still=True)
