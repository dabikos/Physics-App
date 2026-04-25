import type { PhysicsTranslations } from '../translationTypes';
import { testsEn } from './testsEn';

export const translations: PhysicsTranslations = {
  // ==================== SECTIONS ====================
  sections: {
    mechanics: {
      name: "Mechanics",
      subsections: {
        kinematics: {
          name: "Kinematics",
          topics: {
            "linear-motion": "Linear Motion",
            "uniform-accelerated": "Uniform and Accelerated Motion",
            "circular-motion": "Circular Motion",
            "relative-motion": "Relative Motion",
            "motion-graphs": "Motion Graphs",
          },
        },
        dynamics: {
          name: "Dynamics",
          topics: {
            "newton-laws": "Newton's Laws",
            forces: "Forces in Mechanics",
            "multiple-forces": "Motion Under Multiple Forces",
            "inclined-plane": "Inclined Plane",
            momentum: "Momentum and Conservation of Momentum",
          },
        },
        statics: {
          name: "Statics",
          topics: {
            equilibrium: "Equilibrium Conditions",
            torque: "Torque",
            "center-mass": "Center of Mass",
            "simple-machines": "Simple Machines",
          },
        },
        "conservation-laws": {
          name: "Conservation Laws",
          topics: {
            work: "Work",
            "kinetic-energy": "Kinetic Energy",
            "potential-energy": "Potential Energy",
            "energy-conservation": "Conservation of Energy",
          },
        },
        "oscillations-waves": {
          name: "Mechanical Oscillations and Waves",
          topics: {
            "harmonic-oscillations": "Harmonic Oscillations",
            pendulums: "Pendulums",
            "mechanical-waves": "Mechanical Waves",
            resonance: "Resonance",
          },
        },
        gravitation: {
          name: "Gravitation",
          topics: {
            "universal-gravitation": "Law of Universal Gravitation",
            "gravitational-field": "Gravitational Field and Strength",
            "weight-weightlessness": "Weight and Weightlessness",
            "satellites-orbits": "Artificial Satellites and Orbits",
            "kepler-laws": "Kepler's Laws",
            "cosmic-velocities": "First, Second, and Third Cosmic Velocities",
            "gravitational-energy": "Gravitational Potential Energy",
          },
        },
        "fluid-mechanics": {
          name: "Hydrostatics and Hydrodynamics",
          topics: {
            "liquid-pressure": "Pressure in Liquids",
            "pascal-law": "Pascal's Law",
            "archimedes-principle": "Archimedes' Principle",
            "floating-bodies": "Flotation and Submersion",
            "atmospheric-pressure": "Atmospheric Pressure",
            "barometer-manometer": "Barometer and Manometer",
            "hydraulic-machines": "Hydraulic Machines",
            "continuity-equation": "Continuity Equation",
            "bernoulli-equation": "Bernoulli's Equation",
            "fluid-viscosity": "Fluid Viscosity",
            "stokes-law": "Stokes' Law (Drag Force)",
          },
        },
        acoustics: {
          name: "Acoustics",
          topics: {
            "sound-waves": "Sound Waves",
            "sound-speed-media": "Speed of Sound in Media",
            "loudness-intensity": "Loudness and Intensity",
            "decibel-scale": "Decibel Scale",
            "doppler-sound": "Doppler Effect for Sound",
            "acoustic-resonance": "Resonance in Acoustics",
            "ultrasound-infrasound": "Ultrasound and Infrasound",
            "timbre-instruments": "Timbre and Musical Instruments",
            "sound-reflection-absorption": "Reflection and Absorption of Sound",
          },
        },
      },
    },
    thermodynamics: {
      name: "Thermodynamics",
      subsections: {
        "molecular-kinetic": {
          name: "Molecular Kinetic Theory",
          topics: {
            "matter-structure": "Structure of Matter",
            temperature: "Temperature",
            "gas-pressure": "Gas Pressure",
          },
        },
        "heat-processes": {
          name: "Heat Processes",
          topics: {
            "thermal-conductivity": "Thermal Conductivity",
            convection: "Convection",
            radiation: "Radiation",
            "heat-quantity": "Quantity of Heat",
          },
        },
        "ideal-gas": {
          name: "Ideal Gas",
          topics: {
            "state-equation": "Equation of State",
            isoprocesses: "Isoprocesses",
            "gas-laws": "Gas Laws",
          },
        },
        "thermodynamics-laws": {
          name: "Laws of Thermodynamics",
          topics: {
            "first-law": "First Law",
            "second-law": "Second Law",
            "heat-engines": "Heat Engines",
            efficiency: "Efficiency",
          },
        },
        "phase-transitions": {
          name: "Phase Transitions",
          topics: {
            melting: "Melting",
            evaporation: "Evaporation",
            boiling: "Boiling",
            "phase-diagrams": "Phase Diagrams",
          },
        },
      },
    },
    electromagnetism: {
      name: "Electricity and Magnetism",
      subsections: {
        electrostatics: {
          name: "Electrostatics",
          topics: {
            "electric-charge": "Electric Charge",
            "coulomb-law": "Coulomb's Law",
            "electric-field": "Electric Field",
            "potential-voltage": "Potential and Voltage",
            capacitors: "Capacitors",
          },
        },
        "direct-current": {
          name: "Direct Current",
          topics: {
            "current-strength": "Electric Current",
            "ohm-law": "Ohm's Law",
            "work-power": "Work and Power of Current",
            "conductor-connections": "Conductor Connections",
          },
        },
        magnetism: {
          name: "Magnetism",
          topics: {
            "magnetic-field": "Magnetic Field",
            "ampere-force": "Ampere's Force",
            "lorentz-force": "Lorentz Force",
          },
        },
        "electromagnetic-induction": {
          name: "Electromagnetic Induction",
          topics: {
            "faraday-law": "Faraday's Law",
            "lenz-rule": "Lenz's Rule",
            inductance: "Inductance",
            "eddy-currents": "Eddy Currents",
          },
        },
        "alternating-current": {
          name: "Alternating Current",
          topics: {
            "sinusoidal-current": "Sinusoidal Current",
            "reactive-resistance": "Reactive Resistance",
            transformers: "Transformers",
            "power-transmission": "Power Transmission",
          },
        },
      },
    },
    optics: {
      name: "Optics",
      subsections: {
        "geometric-optics": {
          name: "Geometric Optics",
          topics: {
            "light-propagation": "Propagation of Light",
            reflection: "Reflection",
            refraction: "Refraction",
            "lenses-mirrors": "Lenses and Mirrors",
            "optical-devices": "Optical Instruments",
          },
        },
        "wave-optics": {
          name: "Wave Optics",
          topics: {
            interference: "Interference",
            diffraction: "Diffraction",
            polarization: "Polarization",
          },
        },
        "quantum-optics": {
          name: "Quantum Optics",
          topics: {
            "photoelectric-effect": "Photoelectric Effect",
            "light-dualism": "Wave-Particle Duality of Light",
            "emission-spectra": "Emission Spectra",
            lasers: "Lasers",
          },
        },
      },
    },
    atomic: {
      name: "Atomic and Nuclear Physics",
      subsections: {
        "atom-structure": {
          name: "Atomic Structure",
          topics: {
            "atom-models": "Atomic Models",
            "energy-levels": "Energy Levels",
            "electron-shells": "Electron Shells",
          },
        },
        "quantum-physics": {
          name: "Quantum Physics",
          topics: {
            "de-broglie-waves": "De Broglie Waves",
            "heisenberg-uncertainty": "Heisenberg Uncertainty Principle",
          },
        },
        "nuclear-physics": {
          name: "Nuclear Physics",
          topics: {
            "nucleus-structure": "Nuclear Structure",
            "nuclear-forces": "Nuclear Forces",
            "binding-energy": "Binding Energy",
          },
        },
        radioactivity: {
          name: "Radioactivity",
          topics: {
            "decay-types": "Types of Decay",
            "decay-law": "Radioactive Decay Law",
            "radiation-doses": "Radiation Doses",
          },
        },
        "nuclear-reactions": {
          name: "Nuclear Reactions",
          topics: {
            fission: "Nuclear Fission",
            fusion: "Thermonuclear Fusion",
            "nuclear-energy-use": "Applications of Nuclear Energy",
          },
        },
      },
    },
    relativity: {
      name: "Special Relativity",
      subsections: {
        "special-relativity": {
          name: "Special Relativity (STR)",
          topics: {
            "einstein-postulates": "Einstein's Postulates",
            "lorentz-transformations": "Lorentz Transformations",
            "time-dilation": "Time Dilation",
            "length-contraction": "Length Contraction",
            "invariant-interval": "Invariant Spacetime Interval",
            "mass-energy-emc2": "Mass–Energy Relation E = mc²",
            "relativistic-momentum": "Relativistic Momentum",
            "relativistic-energy": "Relativistic Energy",
            "lightspeed-limit": "Why the Speed of Light Cannot Be Reached",
          },
        },
      },
    },
    astronomy: {
      name: "Astronomy",
      subsections: {
        "celestial-mechanics": {
          name: "Celestial Mechanics",
          topics: {
            "solar-system-structure": "The Solar System",
            "orbits-satellites": "Planetary and Satellite Orbits",
            tides: "Tides",
            eclipses: "Solar and Lunar Eclipses",
          },
        },
        "sun-stars": {
          name: "The Sun and Stars",
          topics: {
            "sun-structure-activity": "The Sun: Structure and Activity",
            "stellar-spectra-hr": "Stellar Spectra and Hertzsprung–Russell Diagram",
            "stellar-evolution-types": "Stellar Evolution and Types",
            "compact-stars": "Neutron Stars, Pulsars, and Black Holes",
          },
        },
        "galaxies-cosmology": {
          name: "Galaxies and Cosmology",
          topics: {
            "milky-way-galaxies": "The Milky Way and Galaxy Types",
            "hubble-expansion": "Expanding Universe and Hubble's Law",
            "big-bang-cmb": "Big Bang and Cosmic Microwave Background",
            "dark-cosmos-gr": "Dark Matter, Dark Energy, and General Relativity (brief)",
          },
        },
        "observational-astronomy": {
          name: "Observational Astronomy",
          topics: {
            "telescopes-types": "Telescopes and Instruments",
            "angular-resolution": "Magnification and Angular Resolution",
            "spectroscopy-photometry": "Spectroscopy and Photometry",
            "distance-ladder-radio": "Cosmic Distances and Radio Astronomy",
          },
        },
        "solar-system-bodies": {
          name: "Planets, Small Bodies, and Life",
          topics: {
            "terrestrial-gas-planets": "Terrestrial and Gas Giant Planets",
            "moon-satellites": "The Moon and Major Moons",
            "small-bodies-exoplanets": "Asteroids, Comets, and Exoplanets",
            "life-search": "Habitable Zone and the Search for Life",
          },
        },
      },
    },
  },

  // ==================== TOPICS ====================
  topics: {
    "linear-motion": {
      title: "Linear Motion",
      brief_info: "Linear motion is the movement of a body along a straight line. In uniform linear motion, the body covers equal distances in equal time intervals.",
      example_problem: "A car moves at 72 km/h. What distance will it cover in 2.5 hours?\n\nSolution:\nv = 72 km/h\nt = 2.5 h\nS = v × t = 72 × 2.5 = 180 km\n\nAnswer: 180 km",
    },
    "uniform-accelerated": {
      title: "Uniform and Accelerated Motion",
      brief_info: "Uniformly accelerated motion has constant acceleration. The velocity changes uniformly over time. In uniform motion, velocity is constant and acceleration equals zero.",
      example_problem: "A body starts from rest with acceleration 2 m/s². What velocity will it reach in 5 seconds?\n\nSolution:\nv₀ = 0 m/s\na = 2 m/s²\nt = 5 s\nv = v₀ + at = 0 + 2×5 = 10 m/s\n\nAnswer: 10 m/s",
    },
    "circular-motion": {
      title: "Circular Motion",
      brief_info: "Circular motion is curvilinear motion along a circle. It is characterized by angular velocity, period, and frequency of revolution.",
      example_problem: "A wheel of radius 0.5 m rotates at 2 rev/s. Find the linear velocity of a point on the rim.\n\nSolution:\nR = 0.5 m\nν = 2 Hz\nv = 2πRν = 2 × 3.14 × 0.5 × 2 = 6.28 m/s\n\nAnswer: 6.28 m/s",
    },
    "relative-motion": {
      title: "Relative Motion",
      brief_info: "Motion is relative — its characteristics (velocity, trajectory) depend on the reference frame. The velocity relative to a fixed frame equals the sum of the velocity relative to the moving frame and the frame's velocity.",
      example_problem: "A passenger walks at 5 km/h relative to a train. The train moves at 60 km/h. Find the passenger's speed relative to the ground (walking in the direction of the train).\n\nSolution:\nv = v₁ + v₂ = 60 + 5 = 65 km/h\n\nAnswer: 65 km/h",
    },
    "motion-graphs": {
      title: "Motion Graphs",
      brief_info: "Motion graphs visually represent the dependence of position, velocity, and acceleration on time. From an x(t) graph you can determine the type of motion; from a v(t) graph you can find the distance as the area under the curve.",
      example_problem: "From a v(t) graph, determine the distance in 4 seconds if the graph is a straight line from v=0 at t=0 to v=8 m/s at t=4 s.\n\nSolution:\nDistance = area of triangle = ½ × base × height\nS = ½ × 4 × 8 = 16 m\n\nAnswer: 16 m",
    },
    "newton-laws": {
      title: "Newton's Laws",
      brief_info: "Newton's three laws are the foundation of classical mechanics. 1st law (inertia): a body maintains its state of rest or uniform motion. 2nd law: F = ma. 3rd law: action and reaction forces are equal in magnitude and opposite in direction.",
      example_problem: "A force of 20 N acts on a body of mass 5 kg. Find the acceleration.\n\nSolution:\nm = 5 kg\nF = 20 N\na = F/m = 20/5 = 4 m/s²\n\nAnswer: 4 m/s²",
    },
    forces: {
      title: "Forces in Mechanics",
      brief_info: "Main forces in mechanics: gravity (F = mg), elastic force (F = kx), friction (F = μN), normal force. All forces are measured in newtons.",
      example_problem: "Find the gravitational force acting on a body of mass 10 kg.\n\nSolution:\nm = 10 kg\ng = 10 m/s²\nF = mg = 10 × 10 = 100 N\n\nAnswer: 100 N",
    },
    "multiple-forces": {
      title: "Motion Under Multiple Forces",
      brief_info: "When several forces act on a body, its motion is determined by the resultant — the vector sum of all forces. Acceleration is found using Newton's second law.",
      example_problem: "Two forces act on a body of mass 2 kg: F₁ = 6 N to the right and F₂ = 2 N to the left. Find the acceleration.\n\nSolution:\nF = F₁ - F₂ = 6 - 2 = 4 N\na = F/m = 4/2 = 2 m/s² (to the right)\n\nAnswer: 2 m/s²",
    },
    "inclined-plane": {
      title: "Inclined Plane",
      brief_info: "An inclined plane is a simple machine. Gravity decomposes into components: parallel to the plane (mgsinα) and perpendicular (mgcosα). This determines the body's motion.",
      example_problem: "A body of mass 5 kg is on an inclined plane with angle 30°. Find the force along the plane.\n\nSolution:\nF = mg·sin(30°) = 5 × 10 × 0.5 = 25 N\n\nAnswer: 25 N",
    },
    momentum: {
      title: "Momentum and Conservation of Momentum",
      brief_info: "Momentum p = mv. Conservation of momentum: in an isolated system, total momentum remains constant. Used for analyzing collisions and explosions.",
      example_problem: "Two balls of masses 2 kg and 3 kg move toward each other at 4 m/s and 2 m/s. After collision they stick together. Find the velocity after collision.\n\nSolution:\nm₁v₁ - m₂v₂ = (m₁+m₂)v\n2×4 - 3×2 = 5×v\nv = 2/5 = 0.4 m/s\n\nAnswer: 0.4 m/s",
    },
    equilibrium: {
      title: "Equilibrium Conditions",
      brief_info: "A body is in equilibrium when the sum of all forces equals zero (∑F = 0) and the sum of torques about any axis equals zero (∑M = 0).",
      example_problem: "A beam of mass 20 kg rests on two supports 4 m apart. Find the reaction forces if the center of mass is in the middle.\n\nSolution:\nN₁ + N₂ = mg = 200 N\nBy symmetry: N₁ = N₂ = 100 N\n\nAnswer: 100 N each",
    },
    torque: {
      title: "Torque",
      brief_info: "Torque M = F·d, where d is the moment arm (shortest distance from the axis of rotation to the line of action of the force). Torque causes rotation.",
      example_problem: "A force of 40 N is applied perpendicular to a lever of length 0.5 m. Find the torque.\n\nSolution:\nM = F × d = 40 × 0.5 = 20 N·m\n\nAnswer: 20 N·m",
    },
    "center-mass": {
      title: "Center of Mass",
      brief_info: "The center of mass is the point where all mass can be considered concentrated. For uniform bodies, it coincides with the geometric center. Stable equilibrium requires the center of mass above the support area.",
      example_problem: "Two balls of masses 1 kg and 3 kg are connected by a rod 40 cm long. Find the center of mass position.\n\nSolution:\nx = (m₁x₁ + m₂x₂)/(m₁+m₂)\nx = (1×0 + 3×40)/(1+3) = 30 cm from the first ball\n\nAnswer: 30 cm from the first ball",
    },
    "simple-machines": {
      title: "Simple Machines",
      brief_info: "Simple machines: lever, pulley, wheel and axle, wedge, screw. Golden rule of mechanics: gaining in force means losing in distance. Efficiency = useful work / total work.",
      example_problem: "A lever has arms of 20 cm and 60 cm. What force must be applied to the long arm to lift a 30 kg load?\n\nSolution:\nF₁l₁ = F₂l₂\nF × 60 = 300 × 20\nF = 100 N\n\nAnswer: 100 N",
    },
    work: {
      title: "Work",
      brief_info: "Mechanical work A = F·S·cosα, where α is the angle between the force and displacement. Work is measured in joules. Work of gravity: A = mgh.",
      example_problem: "Find the work done by a force of 50 N when a body moves 4 m in the direction of the force.\n\nSolution:\nA = F × S × cos(0°) = 50 × 4 × 1 = 200 J\n\nAnswer: 200 J",
    },
    "kinetic-energy": {
      title: "Kinetic Energy",
      brief_info: "Kinetic energy is the energy of motion: E = mv²/2. Work-energy theorem: the work done by the net force equals the change in kinetic energy.",
      example_problem: "Find the kinetic energy of a car of mass 1000 kg moving at 20 m/s.\n\nSolution:\nE = mv²/2 = 1000 × 400 / 2 = 200,000 J = 200 kJ\n\nAnswer: 200 kJ",
    },
    "potential-energy": {
      title: "Potential Energy",
      brief_info: "Potential energy is the energy of interaction. In a gravitational field: E = mgh. For a spring: E = kx²/2. Depends on the choice of the reference level.",
      example_problem: "Find the potential energy of a body of mass 5 kg at a height of 10 m.\n\nSolution:\nE = mgh = 5 × 10 × 10 = 500 J\n\nAnswer: 500 J",
    },
    "energy-conservation": {
      title: "Conservation of Energy",
      brief_info: "In an isolated system, total mechanical energy is conserved: E = Ek + Ep = const. In the presence of friction, mechanical energy converts to internal energy.",
      example_problem: "A body falls from a height of 20 m. Find the velocity at the ground (neglecting air resistance).\n\nSolution:\nmgh = mv²/2\nv = √(2gh) = √(2×10×20) = 20 m/s\n\nAnswer: 20 m/s",
    },
    "harmonic-oscillations": {
      title: "Harmonic Oscillations",
      brief_info: "Harmonic oscillations are described by x = A·cos(ωt + φ), where A is amplitude, ω is angular frequency, φ is initial phase. Period T = 2π/ω.",
      example_problem: "A body oscillates with amplitude 5 cm and period 2 s. Find the maximum velocity.\n\nSolution:\nv_max = ωA = (2π/T)A = (2π/2) × 0.05 = 0.157 m/s\n\nAnswer: 15.7 cm/s",
    },
    pendulums: {
      title: "Pendulums",
      brief_info: "Simple pendulum: T = 2π√(l/g). Spring pendulum: T = 2π√(m/k). The period does not depend on amplitude (for small angles).",
      example_problem: "Find the period of a simple pendulum of length 1 m.\n\nSolution:\nT = 2π√(l/g) = 2π√(1/10) = 2π × 0.316 ≈ 2 s\n\nAnswer: ≈ 2 s",
    },
    "mechanical-waves": {
      title: "Mechanical Waves",
      brief_info: "A mechanical wave is the propagation of oscillations in a medium. Characteristics: wavelength λ, speed v, frequency ν. Relation: v = λν. Waves can be longitudinal or transverse.",
      example_problem: "The speed of sound in air is 340 m/s. Find the wavelength at a frequency of 680 Hz.\n\nSolution:\nλ = v/ν = 340/680 = 0.5 m\n\nAnswer: 0.5 m",
    },
    resonance: {
      title: "Resonance",
      brief_info: "Resonance is a sharp increase in amplitude of forced oscillations when the driving frequency matches the natural frequency. Used in music, radio engineering.",
      example_problem: "The natural frequency of a bridge is 2 Hz. At what marching frequency will resonance occur?\n\nSolution:\nResonance occurs when ν_ext = ν_natural = 2 Hz\n\nAnswer: 2 Hz (2 steps per second)",
    },
    "matter-structure": {
      title: "Structure of Matter",
      brief_info: "All substances consist of molecules (atoms) in continuous random motion. Attractive and repulsive forces act between molecules.",
      example_problem: "How many molecules are in 36 g of water?\n\nSolution:\nM(H₂O) = 18 g/mol\nν = m/M = 36/18 = 2 mol\nN = νNₐ = 2 × 6.02×10²³ = 1.2×10²⁴\n\nAnswer: 1.2×10²⁴ molecules",
    },
    temperature: {
      title: "Temperature",
      brief_info: "Temperature is a measure of average kinetic energy of molecules. Relation: E = (3/2)kT. Absolute zero: T = 0 K = -273°C.",
      example_problem: "Find the average kinetic energy of a gas molecule at 27°C.\n\nSolution:\nT = 273 + 27 = 300 K\nE = (3/2)kT = 1.5 × 1.38×10⁻²³ × 300 = 6.21×10⁻²¹ J\n\nAnswer: 6.21×10⁻²¹ J",
    },
    "gas-pressure": {
      title: "Gas Pressure",
      brief_info: "Gas pressure is created by molecular impacts on container walls. Fundamental MKT equation: p = (1/3)nm₀v². Pressure depends on concentration and temperature.",
      example_problem: "Find gas pressure if molecular concentration is 10²⁵ m⁻³, RMS speed is 500 m/s, molecular mass is 5×10⁻²⁶ kg.\n\nSolution:\np = (1/3)nm₀v² = (1/3)×10²⁵×5×10⁻²⁶×250000 ≈ 42 kPa\n\nAnswer: ≈ 42 kPa",
    },
    "thermal-conductivity": {
      title: "Thermal Conductivity",
      brief_info: "Thermal conductivity is heat transfer through particle interaction without mass transfer. Best conductors — metals, worst — gases and porous materials.",
      example_problem: "Section under development",
    },
    convection: {
      title: "Convection",
      brief_info: "Convection is heat transfer by flows of liquid or gas. Heated layers rise, cold ones descend. Used in heating and ventilation.",
      example_problem: "Section under development",
    },
    radiation: {
      title: "Radiation",
      brief_info: "Radiation is energy transfer by electromagnetic waves. No medium required. Dark bodies absorb and emit better than light ones. Stefan-Boltzmann law: P = σT⁴.",
      example_problem: "Section under development",
    },
    "heat-quantity": {
      title: "Quantity of Heat",
      brief_info: "Heat is energy transferred during heat exchange. Q = cmΔT for heating, Q = λm for melting, Q = Lm for vaporization.",
      example_problem: "How much heat is needed to heat 2 kg of water from 20°C to 80°C?\n\nSolution:\nQ = cmΔT = 4200 × 2 × 60 = 504,000 J = 504 kJ\n\nAnswer: 504 kJ",
    },
    "state-equation": {
      title: "Equation of State",
      brief_info: "Ideal gas law (Mendeleev-Clapeyron): pV = νRT relates pressure, volume, and temperature. R = 8.31 J/(mol·K) — universal gas constant.",
      example_problem: "Find the volume of 2 mol of gas at 100 kPa and 300 K.\n\nSolution:\nV = νRT/p = 2×8.31×300/100000 = 0.05 m³\n\nAnswer: 50 L",
    },
    isoprocesses: {
      title: "Isoprocesses",
      brief_info: "Isoprocesses maintain one parameter constant. Isotherm (T=const): pV=const. Isobar (p=const): V/T=const. Isochor (V=const): p/T=const.",
      example_problem: "Gas at 300 K occupies 10 L. What volume will it occupy at 600 K (isobaric)?\n\nSolution:\nV₁/T₁ = V₂/T₂\nV₂ = V₁T₂/T₁ = 10×600/300 = 20 L\n\nAnswer: 20 L",
    },
    "gas-laws": {
      title: "Gas Laws",
      brief_info: "Boyle's law (isotherm), Gay-Lussac's law (isobar), Charles's law (isochor). Combined gas law: pV/T = const.",
      example_problem: "Gas is compressed isothermally from 5 L to 2 L. Initial pressure is 100 kPa. Find the final pressure.\n\nSolution:\np₁V₁ = p₂V₂\np₂ = p₁V₁/V₂ = 100×5/2 = 250 kPa\n\nAnswer: 250 kPa",
    },
    "first-law": {
      title: "First Law of Thermodynamics",
      brief_info: "First law: Q = ΔU + A — heat goes into changing internal energy and doing work. This is conservation of energy for thermal processes.",
      example_problem: "500 J of heat is transferred to a gas, and it does 200 J of work. How did the internal energy change?\n\nSolution:\nΔU = Q - A = 500 - 200 = 300 J\n\nAnswer: increased by 300 J",
    },
    "second-law": {
      title: "Second Law of Thermodynamics",
      brief_info: "The second law determines the direction of thermal processes. Heat cannot spontaneously flow from a cold body to a hot one. Entropy of an isolated system never decreases.",
      example_problem: "Section under development",
    },
    "heat-engines": {
      title: "Heat Engines",
      brief_info: "A heat engine converts heat into work. It consists of a heater, working substance, and cooler. Examples: ICE, steam turbine, refrigerator.",
      example_problem: "Section under development",
    },
    efficiency: {
      title: "Efficiency",
      brief_info: "Efficiency of a heat engine: η = A/Q₁ = (Q₁-Q₂)/Q₁. Maximum efficiency is the Carnot cycle: η = (T₁-T₂)/T₁. Efficiency is always less than 100%.",
      example_problem: "Heater temperature 500 K, cooler 300 K. Find the maximum efficiency.\n\nSolution:\nη = (T₁-T₂)/T₁ = (500-300)/500 = 0.4 = 40%\n\nAnswer: 40%",
    },
    melting: {
      title: "Melting",
      brief_info: "Melting is the transition from solid to liquid at constant temperature. Requires heat of fusion Q = λm. The reverse process is crystallization.",
      example_problem: "How much heat is needed to melt 2 kg of ice at 0°C? (λ = 330 kJ/kg)\n\nSolution:\nQ = λm = 330,000 × 2 = 660,000 J = 660 kJ\n\nAnswer: 660 kJ",
    },
    evaporation: {
      title: "Evaporation",
      brief_info: "Evaporation is the transition from liquid to vapor from the surface at any temperature. Requires heat of vaporization. Rate depends on temperature, surface area, humidity.",
      example_problem: "Section under development",
    },
    boiling: {
      title: "Boiling",
      brief_info: "Boiling is intense vaporization throughout the liquid at a specific temperature. Boiling point depends on pressure. Q = Lm.",
      example_problem: "How much heat is needed to vaporize 0.5 kg of water at 100°C? (L = 2.3 MJ/kg)\n\nSolution:\nQ = Lm = 2,300,000 × 0.5 = 1,150,000 J = 1.15 MJ\n\nAnswer: 1.15 MJ",
    },
    "phase-diagrams": {
      title: "Phase Diagrams",
      brief_info: "A phase diagram shows regions of substance phases in p-T coordinates. Triple point — coexistence of all three phases. Critical point — disappearance of the liquid-gas boundary.",
      example_problem: "Section under development",
    },
    "electric-charge": {
      title: "Electric Charge",
      brief_info: "Electric charge is a property of bodies to interact via electromagnetic fields. Charge is quantized: q = ne (e = 1.6×10⁻¹⁹ C). Charge is conserved.",
      example_problem: "How many electrons must be removed for a body to acquire a charge of 3.2×10⁻¹⁸ C?\n\nSolution:\nn = q/e = 3.2×10⁻¹⁸ / 1.6×10⁻¹⁹ = 20 electrons\n\nAnswer: 20 electrons",
    },
    "coulomb-law": {
      title: "Coulomb's Law",
      brief_info: "Force between two point charges: F = k|q₁q₂|/r², where k = 9×10⁹ N·m²/C². Like charges repel, unlike charges attract.",
      example_problem: "Find the force between two charges of 1 μC at a distance of 3 m.\n\nSolution:\nF = kq₁q₂/r² = 9×10⁹ × 10⁻⁶ × 10⁻⁶ / 9 = 0.001 N = 1 mN\n\nAnswer: 1 mN",
    },
    "electric-field": {
      title: "Electric Field",
      brief_info: "An electric field is a form of matter through which charges interact. Characterized by field strength E = F/q. Field lines go from + to -.",
      example_problem: "Find the field strength of a 2 μC point charge at 1 m distance.\n\nSolution:\nE = kq/r² = 9×10⁹ × 2×10⁻⁶ / 1 = 18,000 V/m = 18 kV/m\n\nAnswer: 18 kV/m",
    },
    "potential-voltage": {
      title: "Potential and Voltage",
      brief_info: "Potential φ = W/q — energy characteristic of the field. Voltage U = φ₁ - φ₂ = A/q. Relation with field strength: E = U/d (uniform field).",
      example_problem: "Find the work done moving a charge of 5 μC between points with a potential difference of 100 V.\n\nSolution:\nA = qU = 5×10⁻⁶ × 100 = 5×10⁻⁴ J = 0.5 mJ\n\nAnswer: 0.5 mJ",
    },
    capacitors: {
      title: "Capacitors",
      brief_info: "A capacitor stores electric charge. Capacitance C = q/U. For a parallel plate capacitor: C = ε₀εS/d. Energy: W = CU²/2 = q²/2C.",
      example_problem: "Find the capacitance if, at a voltage of 100 V, it accumulates a charge of 5 μC.\n\nSolution:\nC = q/U = 5×10⁻⁶ / 100 = 5×10⁻⁸ F = 50 nF\n\nAnswer: 50 nF",
    },
    "current-strength": {
      title: "Electric Current",
      brief_info: "Current I = q/t — charge passing through a cross-section per unit time. Measured in amperes. Current direction is the direction of positive charge movement.",
      example_problem: "A charge of 50 C passes through a conductor in 10 s. Find the current.\n\nSolution:\nI = q/t = 50/10 = 5 A\n\nAnswer: 5 A",
    },
    "ohm-law": {
      title: "Ohm's Law",
      brief_info: "Ohm's law for a circuit section: I = U/R. For a complete circuit: I = ε/(R+r), where ε is EMF, r is internal resistance.",
      example_problem: "Find the current at voltage 12 V and resistance 4 Ω.\n\nSolution:\nI = U/R = 12/4 = 3 A\n\nAnswer: 3 A",
    },
    "work-power": {
      title: "Work and Power of Current",
      brief_info: "Work of current A = UIt = I²Rt = U²t/R. Power P = UI = I²R = U²/R. Joule-Lenz law: Q = I²Rt — heat produced by a conductor.",
      example_problem: "Find the power consumed by a lamp at 220 V and current 0.5 A.\n\nSolution:\nP = UI = 220 × 0.5 = 110 W\n\nAnswer: 110 W",
    },
    "conductor-connections": {
      title: "Conductor Connections",
      brief_info: "Series: R = R₁+R₂, I is the same, U = U₁+U₂. Parallel: 1/R = 1/R₁+1/R₂, U is the same, I = I₁+I₂.",
      example_problem: "Find the total resistance of two 6 Ω resistors connected in parallel.\n\nSolution:\n1/R = 1/6 + 1/6 = 2/6 = 1/3\nR = 3 Ω\n\nAnswer: 3 Ω",
    },
    "magnetic-field": {
      title: "Magnetic Field",
      brief_info: "A magnetic field is created by moving charges and acts on moving charges. Characterized by induction B (T). Field lines are closed.",
      example_problem: "Section under development",
    },
    "ampere-force": {
      title: "Ampere's Force",
      brief_info: "Ampere's force acts on a current-carrying conductor in a magnetic field: F = BILsinα. Direction is determined by the left-hand rule.",
      example_problem: "Find the force on a 0.5 m conductor carrying 2 A in a 0.1 T field (perpendicular).\n\nSolution:\nF = BIL = 0.1 × 2 × 0.5 = 0.1 N\n\nAnswer: 0.1 N",
    },
    "lorentz-force": {
      title: "Lorentz Force",
      brief_info: "The Lorentz force acts on a moving charge in a magnetic field: F = qvBsinα. It causes the charge to move in a circle or spiral.",
      example_problem: "Find the radius of an electron's path at 10⁶ m/s in a 0.01 T magnetic field.\n\nSolution:\nR = mv/(qB) = 9.1×10⁻³¹ × 10⁶ / (1.6×10⁻¹⁹ × 0.01) ≈ 0.57 mm\n\nAnswer: ≈ 0.57 mm",
    },
    "faraday-law": {
      title: "Faraday's Law",
      brief_info: "Induced EMF equals the rate of change of magnetic flux: ε = -dΦ/dt. The minus sign is Lenz's rule. This is the basis of generators.",
      example_problem: "Magnetic flux through a coil changed by 0.5 Wb in 0.1 s. Find the induced EMF.\n\nSolution:\nε = ΔΦ/Δt = 0.5/0.1 = 5 V\n\nAnswer: 5 V",
    },
    "lenz-rule": {
      title: "Lenz's Rule",
      brief_info: "The induced current flows in a direction to oppose the cause that produced it. This is a consequence of the conservation of energy.",
      example_problem: "Section under development",
    },
    inductance: {
      title: "Inductance",
      brief_info: "Inductance L characterizes a coil's ability to create magnetic flux: Φ = LI. Self-induced EMF: ε = -L(dI/dt). Magnetic field energy: W = LI²/2.",
      example_problem: "Find the energy of the magnetic field of a coil with inductance 0.5 H at current 2 A.\n\nSolution:\nW = LI²/2 = 0.5 × 4 / 2 = 1 J\n\nAnswer: 1 J",
    },
    "eddy-currents": {
      title: "Eddy Currents",
      brief_info: "Eddy currents (Foucault currents) are induced currents in bulk conductors. They cause heating. Used in induction furnaces and dampers.",
      example_problem: "Section under development",
    },
    "sinusoidal-current": {
      title: "Sinusoidal Current",
      brief_info: "Alternating current follows a sinusoidal law: i = I₀sin(ωt). Characterized by amplitude, frequency, and phase. RMS value: I = I₀/√2.",
      example_problem: "The peak alternating current is 10 A. Find the RMS value.\n\nSolution:\nI = I₀/√2 = 10/1.41 ≈ 7.07 A\n\nAnswer: ≈ 7.07 A",
    },
    "reactive-resistance": {
      title: "Reactive Resistance",
      brief_info: "Inductive reactance: X_L = ωL. Capacitive: X_C = 1/(ωC). Impedance: Z = √(R² + (X_L - X_C)²).",
      example_problem: "Find the inductive reactance of a 0.1 H coil at 50 Hz.\n\nSolution:\nX_L = 2πfL = 2π × 50 × 0.1 ≈ 31.4 Ω\n\nAnswer: ≈ 31.4 Ω",
    },
    transformers: {
      title: "Transformers",
      brief_info: "A transformer changes AC voltage. Transformation ratio: k = U₁/U₂ = n₁/n₂. k>1 — step-down, k<1 — step-up.",
      example_problem: "Primary winding has 1000 turns, secondary 50 turns. Find the output voltage with 220 V input.\n\nSolution:\nU₂ = U₁n₂/n₁ = 220 × 50/1000 = 11 V\n\nAnswer: 11 V",
    },
    "power-transmission": {
      title: "Power Transmission",
      brief_info: "To reduce losses (P = I²R), electricity is transmitted at high voltage. At the power plant voltage is stepped up, at the consumer it is stepped down using transformers.",
      example_problem: "Section under development",
    },
    "light-propagation": {
      title: "Propagation of Light",
      brief_info: "Light travels in straight lines in a uniform medium. Speed of light in vacuum c = 3×10⁸ m/s. In a medium, speed is lower: v = c/n, where n is the refractive index.",
      example_problem: "Find the speed of light in water (n = 1.33).\n\nSolution:\nv = c/n = 3×10⁸/1.33 ≈ 2.26×10⁸ m/s\n\nAnswer: ≈ 2.26×10⁸ m/s",
    },
    reflection: {
      title: "Reflection",
      brief_info: "Law of reflection: the angle of incidence equals the angle of reflection (α = β). Rays lie in the same plane as the normal. Specular reflection is from smooth surfaces.",
      example_problem: "A ray hits a mirror at 30° to the surface. Find the angle between the incident and reflected rays.\n\nSolution:\nAngle of incidence to normal: 90° - 30° = 60°\nAngle between rays: 60° + 60° = 120°\n\nAnswer: 120°",
    },
    refraction: {
      title: "Refraction",
      brief_info: "Snell's law: n₁sinα = n₂sinβ. When entering a denser medium, light bends toward the normal. Total internal reflection: sinα_cr = n₂/n₁.",
      example_problem: "A ray passes from air to water (n=1.33) at 45°. Find the angle of refraction.\n\nSolution:\nsinβ = sinα/n = sin45°/1.33 = 0.707/1.33 ≈ 0.53\nβ ≈ 32°\n\nAnswer: ≈ 32°",
    },
    "lenses-mirrors": {
      title: "Lenses and Mirrors",
      brief_info: "Thin lens formula: 1/F = 1/d + 1/f. Optical power D = 1/F (diopters). Magnification: Γ = f/d = H/h. Converging lens: F>0, diverging: F<0.",
      example_problem: "Focal length of a lens is 20 cm. Object is at 30 cm. Find the image distance.\n\nSolution:\n1/f = 1/F - 1/d = 1/20 - 1/30 = 1/60\nf = 60 cm\n\nAnswer: 60 cm",
    },
    "optical-devices": {
      title: "Optical Instruments",
      brief_info: "Eye, magnifying glass, microscope, telescope, camera — optical instruments. Magnifying glass: Γ = 25/F cm. Microscope: Γ = Γ_obj × Γ_eye. Telescope: Γ = F_obj/F_eye.",
      example_problem: "Find the magnification of a magnifying glass with focal length 5 cm.\n\nSolution:\nΓ = 25/F = 25/5 = 5×\n\nAnswer: 5× magnification",
    },
    interference: {
      title: "Interference",
      brief_info: "Interference is the superposition of coherent waves. Maximum at path difference Δ = kλ, minimum at Δ = (2k+1)λ/2. Used in interferometers and lens coating.",
      example_problem: "Section under development",
    },
    diffraction: {
      title: "Diffraction",
      brief_info: "Diffraction is the bending of waves around obstacles. Diffraction grating: d·sinφ = kλ. Used in spectral analysis.",
      example_problem: "Grating period is 0.01 mm. Find the diffraction angle for λ = 500 nm (1st order).\n\nSolution:\nsinφ = λ/d = 500×10⁻⁹/10⁻⁵ = 0.05\nφ ≈ 2.9°\n\nAnswer: ≈ 2.9°",
    },
    polarization: {
      title: "Polarization",
      brief_info: "Polarization is selecting oscillations in one plane. Light is a transverse wave. Malus's law: I = I₀cos²φ. Used in 3D glasses and LCD displays.",
      example_problem: "Section under development",
    },
    "photoelectric-effect": {
      title: "Photoelectric Effect",
      brief_info: "Photoelectric effect is the ejection of electrons by light. Einstein's equation: hν = A + mv²/2. Red limit: ν₀ = A/h. Photoelectric laws confirmed the quantum nature of light.",
      example_problem: "Work function is 2 eV. Find the red limit of the photoelectric effect.\n\nSolution:\nν₀ = A/h = 2×1.6×10⁻¹⁹/(6.63×10⁻³⁴) ≈ 4.8×10¹⁴ Hz\n\nAnswer: ≈ 4.8×10¹⁴ Hz",
    },
    "light-dualism": {
      title: "Wave-Particle Duality of Light",
      brief_info: "Light exhibits both wave (interference, diffraction) and particle (photoelectric effect) properties. A photon has energy E = hν and momentum p = h/λ.",
      example_problem: "Find the momentum of a photon with wavelength 500 nm.\n\nSolution:\np = h/λ = 6.63×10⁻³⁴/500×10⁻⁹ = 1.33×10⁻²⁷ kg·m/s\n\nAnswer: 1.33×10⁻²⁷ kg·m/s",
    },
    "emission-spectra": {
      title: "Emission Spectra",
      brief_info: "Spectra: continuous (heated solids), line (atoms), band (molecules). Spectral analysis determines the composition of a substance.",
      example_problem: "Section under development",
    },
    lasers: {
      title: "Lasers",
      brief_info: "A laser is a source of coherent monochromatic radiation. Based on stimulated emission. Used in medicine, communications, and technology.",
      example_problem: "Section under development",
    },
    "atom-models": {
      title: "Atomic Models",
      brief_info: "Thomson model (plum pudding), Rutherford's planetary model, Bohr model with quantum orbits. Modern quantum mechanical model describes electron clouds.",
      example_problem: "Section under development",
    },
    "energy-levels": {
      title: "Energy Levels",
      brief_info: "Electron energy in atoms is quantized. For hydrogen: E_n = -13.6/n² eV. When transitioning between levels, a photon with energy hν = E₂ - E₁ is emitted or absorbed.",
      example_problem: "Find the photon energy for an electron transition from the 3rd to 2nd level in hydrogen.\n\nSolution:\nE₃ = -13.6/9 = -1.51 eV\nE₂ = -13.6/4 = -3.4 eV\nhν = E₃ - E₂ = 1.89 eV\n\nAnswer: 1.89 eV",
    },
    "electron-shells": {
      title: "Electron Shells",
      brief_info: "Electrons reside in shells (K, L, M...). Maximum number of electrons per shell: 2n². The Pauli exclusion principle forbids identical quantum states.",
      example_problem: "Section under development",
    },
    "de-broglie-waves": {
      title: "De Broglie Waves",
      brief_info: "Every particle has wave properties. De Broglie wavelength: λ = h/p = h/(mv). Wave properties manifest in microparticles.",
      example_problem: "Find the wavelength of an electron with energy 100 eV.\n\nSolution:\nλ = h/√(2mE) = 6.63×10⁻³⁴/√(2×9.1×10⁻³¹×1.6×10⁻¹⁷)\nλ ≈ 0.12 nm\n\nAnswer: ≈ 0.12 nm",
    },
    "heisenberg-uncertainty": {
      title: "Heisenberg Uncertainty Principle",
      brief_info: "It is impossible to simultaneously measure the coordinate and momentum of a particle exactly: Δx·Δp ≥ ℏ/2. Similarly for energy and time: ΔE·Δt ≥ ℏ/2.",
      example_problem: "Section under development",
    },
    "nucleus-structure": {
      title: "Nuclear Structure",
      brief_info: "The nucleus consists of protons and neutrons (nucleons). Atomic number Z — number of protons. Mass number A = Z + N. Isotopes have the same Z but different N.",
      example_problem: "How many protons and neutrons are in the ²³⁸U nucleus?\n\nSolution:\nZ = 92 (protons)\nN = A - Z = 238 - 92 = 146 (neutrons)\n\nAnswer: 92 protons, 146 neutrons",
    },
    "nuclear-forces": {
      title: "Nuclear Forces",
      brief_info: "Nuclear forces are attractive forces between nucleons. Short-range (≈10⁻¹⁵ m), charge-independent, exhibit saturation. Much stronger than electromagnetic forces.",
      example_problem: "Section under development",
    },
    "binding-energy": {
      title: "Binding Energy",
      brief_info: "Binding energy is the energy needed to separate a nucleus into nucleons. E_b = Δm·c². Mass defect: Δm = Zm_p + Nm_n - M_nucleus. Specific binding energy is maximum for Fe.",
      example_problem: "Section under development",
    },
    "decay-types": {
      title: "Types of Decay",
      brief_info: "α-decay: ⁴He is emitted (Z→Z-2, A→A-4). β-decay: electron emitted (Z→Z+1, A=const). γ-radiation: electromagnetic radiation (Z, A unchanged).",
      example_problem: "Write the α-decay reaction of ²²⁶Ra.\n\nSolution:\n²²⁶Ra → ²²²Rn + ⁴He\n(88→86, 226→222)\n\nAnswer: ²²⁶Ra → ²²²Rn + ⁴He",
    },
    "decay-law": {
      title: "Radioactive Decay Law",
      brief_info: "N = N₀·2^(-t/T), where T is the half-life. During time T, half the nuclei decay. Activity A = λN decreases by the same law.",
      example_problem: "Half-life of iodine-131 is 8 days. How much remains after 24 days?\n\nSolution:\nt/T = 24/8 = 3\nN = N₀/2³ = N₀/8 = 12.5%\n\nAnswer: 12.5% of the initial amount",
    },
    "radiation-doses": {
      title: "Radiation Doses",
      brief_info: "Absorbed dose D (Gy) is energy per unit mass. Equivalent dose H (Sv) = D·k accounts for radiation type. Population limit ~1 mSv/year.",
      example_problem: "Section under development",
    },
    fission: {
      title: "Nuclear Fission",
      brief_info: "Fission of heavy nuclei (U, Pu) upon neutron capture. Releases ~200 MeV and 2-3 neutrons → chain reaction. Basis of nuclear power plants and atomic bombs.",
      example_problem: "Section under development",
    },
    fusion: {
      title: "Thermonuclear Fusion",
      brief_info: "Fusion of light nuclei (H, He) at high temperatures. Energy source of the Sun and stars. Condition: T > 10⁷ K. Promising energy source (tokamak).",
      example_problem: "Section under development",
    },
    "nuclear-energy-use": {
      title: "Applications of Nuclear Energy",
      brief_info: "Nuclear power plants use controlled chain reactions. Advantages: large energy from small fuel amounts. Challenges: radioactive waste, safety concerns.",
      example_problem: "Section under development",
    },
    "universal-gravitation": {
      title: "Law of Universal Gravitation",
      brief_info: "Any two bodies attract with F = G·m₁·m₂/r², G ≈ 6.67×10⁻¹¹ N·m²/kg². The force lies along the line joining their centers.",
      example_problem: "Two 100 kg spheres touch (center distance r = 0.2 m). Estimate the gravitational force.\n\nF = Gm²/r² ≈ 1.7×10⁻⁵ N — tiny for everyday masses.",
    },
    "gravitational-field": {
      title: "Gravitational Field and Field Strength",
      brief_info: "The field is described by strength γ = F/m. For a point mass M: γ = GM/r², directed toward the source.",
      example_problem: "Near Earth's surface, γ ≈ GM/R² ≈ 9.8 m/s² — the same as g.",
    },
    "weight-weightlessness": {
      title: "Weight and Weightlessness",
      brief_info: "Weight is the force on a support or suspension. In an upward-accelerating elevator, weight exceeds mg; in free fall or orbit, apparent weight can be zero (weightlessness).",
      example_problem: "Elevator accelerates upward at 2 m/s². Weight of a 70 kg person? P = m(g+a) = 840 N.",
    },
    "satellites-orbits": {
      title: "Artificial Satellites and Orbits",
      brief_info: "For a circular orbit, gravity provides centripetal force: v = √(GM/r), period T = 2πr/v.",
      example_problem: "Higher orbit means lower speed and longer period (Kepler).",
    },
    "kepler-laws": {
      title: "Kepler's Laws",
      brief_info: "1) Orbits are ellipses with the Sun at a focus. 2) Equal areas in equal times. 3) T²/a³ is the same for all planets.",
      example_problem: "If Mars's period is 1.88 Earth years, its semimajor axis is about 1.52 AU.",
    },
    "cosmic-velocities": {
      title: "First, Second, and Third Cosmic Velocities",
      brief_info: "I: circular orbit near Earth ≈ 7.9 km/s. II: escape from Earth ≈ 11.2 km/s. III: escape from the Solar System from Earth ≈ 16.7 km/s.",
      example_problem: "v₂/v₁ = √2 because escape requires zero total mechanical energy vs negative for a bound circular orbit.",
    },
    "gravitational-energy": {
      title: "Gravitational Potential Energy",
      brief_info: "For two point masses, E_p = -Gm₁m₂/r (zero at infinity). Gravitational work is path-independent.",
      example_problem: "Raising a satellite from R to 2R increases (makes less negative) potential energy by GMm/(2R).",
    },
    "liquid-pressure": {
      title: "Pressure in Liquids",
      brief_info: "Hydrostatic pressure p = p₀ + ρgh increases with depth; at rest, pressure is the same on the same horizontal level.",
      example_problem: "Extra pressure 2×10⁵ Pa in water (ρ = 1000 kg/m³): depth h = p/(ρg) = 20 m.",
    },
    "pascal-law": {
      title: "Pascal's Law",
      brief_info: "Pressure applied to a confined fluid is transmitted undiminished — basis of hydraulic presses and brakes.",
      example_problem: "Same pressure on small and large pistons: F₂ = p·S₂ can be much larger than F₁.",
    },
    "archimedes-principle": {
      title: "Archimedes' Principle",
      brief_info: "Buoyant force equals the weight of displaced fluid: F_A = ρ_fluid·g·V_submerged.",
      example_problem: "Fully submerged 0.5 dm³ block in water: F_A ≈ 5 N.",
    },
    "floating-bodies": {
      title: "Flotation and Submersion",
      brief_info: "A body floats if average density is less than the fluid or if buoyancy balances weight. Fraction submerged: V_sub/V = ρ_body/ρ_fluid.",
      example_problem: "Wood with ρ = 600 kg/m³ floating on water: 60% submerged, 40% above the surface.",
    },
    "atmospheric-pressure": {
      title: "Atmospheric Pressure",
      brief_info: "Air column at sea level gives p_atm ≈ 10⁵ Pa ≈ 760 mm Hg; pressure drops with altitude.",
      example_problem: "Force on 150 cm² palm at 10⁵ Pa: F = pS ≈ 1500 N.",
    },
    "barometer-manometer": {
      title: "Barometer and Manometer",
      brief_info: "Mercury barometer height h = p/(ρg). Manometers measure gauge pressure relative to atmosphere.",
      example_problem: "Water barometer for 10⁵ Pa needs h ≈ 10 m — impractical; mercury is used instead.",
    },
    "hydraulic-machines": {
      title: "Hydraulic Machines",
      brief_info: "Hydraulic presses multiply force via Pascal's law; energy is conserved when piston displacements are accounted for.",
      example_problem: "Efficiency links input work to useful output work on the load.",
    },
    "continuity-equation": {
      title: "Continuity Equation",
      brief_info: "Steady flow: S₁v₁ = S₂v₂ — narrower cross section means higher speed.",
      example_problem: "Area drops by 4× → speed increases 4×.",
    },
    "bernoulli-equation": {
      title: "Bernoulli's Equation",
      brief_info: "Along a streamline for an ideal fluid: p + ρv²/2 + ρgh = const. Faster flow tends to mean lower pressure.",
      example_problem: "Used qualitatively for lift, atomizers, and Venturi meters.",
    },
    "fluid-viscosity": {
      title: "Fluid Viscosity",
      brief_info: "Viscosity η describes internal friction between fluid layers; important for pipe flow and Stokes drag.",
      example_problem: "Honey flows more slowly than water mainly because η is much larger.",
    },
    "stokes-law": {
      title: "Stokes' Law (Drag Force)",
      brief_info: "For a small sphere in laminar flow: F = 6πηRv — sets terminal speed for microscopic drops and sedimentation.",
      example_problem: "Terminal velocity balances weight, buoyancy, and viscous drag.",
    },
    "sound-waves": {
      title: "Sound Waves",
      brief_info: "Longitudinal mechanical waves; need a medium. v = λν relates speed, wavelength, and frequency.",
      example_problem: "440 Hz in air at 340 m/s: λ ≈ 0.77 m.",
    },
    "sound-speed-media": {
      title: "Speed of Sound in Different Media",
      brief_info: "Generally fastest in solids, then liquids, then gases; in air near 20°C v ≈ 343 m/s, in water ~1500 m/s.",
      example_problem: "Sound arrives faster underwater than through air over the same path length.",
    },
    "loudness-intensity": {
      title: "Loudness and Intensity",
      brief_info: "Intensity I is power per area (W/m²). Perceived loudness grows roughly logarithmically with I; point sources give I ∝ 1/r².",
      example_problem: "Doubling distance from a point source reduces I by a factor of four.",
    },
    "decibel-scale": {
      title: "Decibel Scale",
      brief_info: "Sound level L = 10·log₁₀(I/I₀) dB with I₀ = 10⁻¹² W/m². Each +10 dB corresponds to a 10× intensity increase.",
      example_problem: "I increases 100× → level rises by 20 dB.",
    },
    "doppler-sound": {
      title: "Doppler Effect for Sound",
      brief_info: "Motion of source or observer shifts observed frequency — higher when approaching, lower when receding.",
      example_problem: "Ambulance siren pitch drops as it passes you.",
    },
    "acoustic-resonance": {
      title: "Resonance in Acoustics",
      brief_info: "Air columns and strings have natural frequencies; driving at those frequencies produces large amplitude (organ pipes, guitars).",
      example_problem: "Open pipe length selects harmonics of standing sound waves.",
    },
    "ultrasound-infrasound": {
      title: "Ultrasound and Infrasound",
      brief_info: "Ultrasound (>20 kHz): imaging, sonar. Infrasound (<20 Hz): earthquakes, explosions; felt more than heard.",
      example_problem: "1 MHz ultrasound has period 1 μs.",
    },
    "timbre-instruments": {
      title: "Timbre and Musical Instruments",
      brief_info: "Timbre comes from the mix of harmonics and temporal envelope — same note, different instruments.",
      example_problem: "Spectrum distinguishes violin from flute at the same fundamental frequency.",
    },
    "sound-reflection-absorption": {
      title: "Reflection and Absorption of Sound",
      brief_info: "Hard walls reflect; porous materials absorb. Reverberation is multiple reflections decaying over time.",
      example_problem: "Concert halls are designed to balance clarity and reverberation time.",
    },
    "einstein-postulates": {
      title: "Einstein's Postulates",
      brief_info: "(1) Physics laws are the same in all inertial frames. (2) c in vacuum is the same for all observers, regardless of source motion.",
      example_problem: "These require Lorentz transformations instead of Galilean velocity addition at high speeds.",
    },
    "lorentz-transformations": {
      title: "Lorentz Transformations",
      brief_info: "Relate coordinates and time between inertial frames moving at relative speed v; γ = 1/√(1−v²/c²).",
      example_problem: "For γ = 2, v ≈ 0.866c.",
    },
    "time-dilation": {
      title: "Time Dilation",
      brief_info: "Moving clocks tick slower from the lab frame: Δt = γ·Δt₀ for proper time Δt₀.",
      example_problem: "Fast muons reach the ground because their lifetime is dilated in Earth's frame.",
    },
    "length-contraction": {
      title: "Length Contraction",
      brief_info: "Lengths along motion shrink in the lab frame: L = L₀/γ; transverse sizes unchanged.",
      example_problem: "γ = 2 halves the measured length of a rod moving along itself.",
    },
    "invariant-interval": {
      title: "Invariant Spacetime Interval",
      brief_info: "s² = (cΔt)² − Δr² is the same in all inertial frames; light rays have s = 0.",
      example_problem: "Interval invariance underpins causality and light cones.",
    },
    "mass-energy-emc2": {
      title: "Mass–Energy Relation E = mc²",
      brief_info: "Rest energy E₀ = mc²; mass and energy are equivalent; nuclear reactions convert small mass defects to large energy.",
      example_problem: "9×10¹³ J corresponds to about 1 g mass difference via ΔE = Δm·c².",
    },
    "relativistic-momentum": {
      title: "Relativistic Momentum",
      brief_info: "p = γmv replaces mv; momentum grows without bound as v → c, consistent with limited v.",
      example_problem: "At v = 0.6c, p/(mv) = γ = 1.25.",
    },
    "relativistic-energy": {
      title: "Relativistic Energy",
      brief_info: "Total energy E = γmc²; kinetic K = (γ−1)mc²; invariant relation E² = (pc)² + (mc²)².",
      example_problem: "When γ = 2, kinetic energy equals rest energy.",
    },
    "lightspeed-limit": {
      title: "Why the Speed of Light Cannot Be Reached",
      brief_info: "Accelerating a massive particle toward c requires unbounded energy as γ → ∞; massless quanta move exactly at c.",
      example_problem: "No finite work can push m₀ > 0 to exactly c.",
    },
    "solar-system-structure": {
      title: "The Solar System",
      brief_info: "Sun, eight planets, dwarf planets, asteroids, comets, rings; inner rocky planets vs outer gas and ice giants.",
      example_problem: "Composition gradient reflects temperature during planet formation.",
    },
    "orbits-satellites": {
      title: "Planetary and Satellite Orbits",
      brief_info: "Nearly Keplerian ellipses; moons obey the same gravity. Geostationary orbit: 24 h period above the equator.",
      example_problem: "The Moon shows one face due to tidal locking.",
    },
    tides: {
      title: "Tides",
      brief_info: "Differential gravity from Moon and Sun deforms oceans; spring tides at new and full Moon.",
      example_problem: "Sun and Moon aligned → stronger tidal bulge.",
    },
    eclipses: {
      title: "Solar and Lunar Eclipses",
      brief_info: "Solar: Moon blocks the Sun (new Moon). Lunar: Earth blocks sunlight reaching the Moon (full Moon).",
      example_problem: "Not every new Moon eclipses the Sun because the Moon's orbit is inclined to the ecliptic.",
    },
    "sun-structure-activity": {
      title: "The Sun: Structure and Activity",
      brief_info: "Core fusion, radiative and convective zones, photosphere, chromosphere, corona; sunspots and flares are magnetic activity.",
      example_problem: "Solar energy comes from hydrogen fusion in the core.",
    },
    "stellar-spectra-hr": {
      title: "Stellar Spectra and HR Diagram",
      brief_info: "Spectral type reveals surface temperature; HR diagram plots luminosity vs temperature — main sequence, giants, white dwarfs.",
      example_problem: "Red giants lie above/right of the main sequence.",
    },
    "stellar-evolution-types": {
      title: "Stellar Evolution and Types",
      brief_info: "From cloud collapse to main sequence, then red giant, planetary nebula and white dwarf for Sun-like stars; massive stars may explode as supernovae.",
      example_problem: "The Sun's end state: white dwarf + expelled shell.",
    },
    "compact-stars": {
      title: "Neutron Stars, Pulsars, and Black Holes",
      brief_info: "Core collapse can yield neutron stars (beamed emission → pulsars) or black holes beyond the Schwarzschild limit.",
      example_problem: "Pulsar pulses are like a lighthouse beam from a spinning neutron star.",
    },
    "milky-way-galaxies": {
      title: "The Milky Way and Galaxy Types",
      brief_info: "Our barred spiral with disk and halo; types include spirals, ellipticals, irregulars; central supermassive black hole.",
      example_problem: "Order-of-magnitude ~10¹¹ stars in the Milky Way.",
    },
    "hubble-expansion": {
      title: "Expanding Universe and Hubble's Law",
      brief_info: "Galaxies recede on average: v ≈ H₀·d; redshift measures recession for distant objects.",
      example_problem: "H₀ ≈ 70 km/s/Mpc gives distance from recession velocity.",
    },
    "big-bang-cmb": {
      title: "Big Bang and Cosmic Microwave Background",
      brief_info: "Hot early universe cooled; CMB at ~2.7 K is relic radiation with tiny anisotropies.",
      example_problem: "CMB supports a hot, dense early state and subsequent expansion.",
    },
    "dark-cosmos-gr": {
      title: "Dark Matter, Dark Energy, and GR (brief)",
      brief_info: "Dark matter explains flat rotation curves and lensing; dark energy drives accelerated expansion. GR describes gravity as spacetime curvature.",
      example_problem: "Dark energy acts like negative pressure; dark matter clusters like matter.",
    },
    "telescopes-types": {
      title: "Telescopes and Instruments",
      brief_info: "Refractors, reflectors, radio dishes, space telescopes above seeing-limited atmosphere.",
      example_problem: "Large mirrors are easier than huge lenses for astronomy.",
    },
    "angular-resolution": {
      title: "Magnification and Angular Resolution",
      brief_info: "Diffraction limit θ ~ λ/D; bigger aperture or shorter wavelength improves detail; interferometry increases effective baseline.",
      example_problem: "Large telescopes resolve smaller angles on the sky.",
    },
    "spectroscopy-photometry": {
      title: "Spectroscopy and Photometry",
      brief_info: "Spectra yield composition, temperature, radial velocity; photometry measures flux through filters.",
      example_problem: "Redshifted galaxy lines indicate recession.",
    },
    "distance-ladder-radio": {
      title: "Cosmic Distances and Radio Astronomy",
      brief_info: "Parallax, standard candles, then Hubble's law for cosmological distances; radio maps quasars and cold gas.",
      example_problem: "Very distant galaxies use Hubble relation when individual candles are unavailable.",
    },
    "terrestrial-gas-planets": {
      title: "Terrestrial and Gas Giant Planets",
      brief_info: "Mercury to Mars: rocky surfaces. Jupiter and Saturn: mostly H/He. Uranus and Neptune: ice giants.",
      example_problem: "Jupiter has no solid surface like Earth's — layered fluid interior.",
    },
    "moon-satellites": {
      title: "The Moon and Major Moons",
      brief_info: "Phases from Sun–Earth–Moon geometry; tidal locking. Giant-planet moons (Titan, Europa) are astrobiology targets.",
      example_problem: "We see one lunar face because rotation period equals orbital period.",
    },
    "small-bodies-exoplanets": {
      title: "Asteroids, Comets, and Exoplanets",
      brief_info: "Asteroid belt, Kuiper belt, Oort cloud; cometary tails near the Sun; exoplanets via transits and radial velocity.",
      example_problem: "Transits dim a star periodically when a planet crosses its disk.",
    },
    "life-search": {
      title: "Habitable Zone and the Search for Life",
      brief_info: "Liquid-water distance from a star; SETI for technosignatures; missions seek organics and subsurface oceans.",
      example_problem: "Habitable zone width depends on stellar luminosity.",
    },
  },

  // ==================== FORMULAS ====================
  formulas: {
    "f-1": { name: "Velocity", description: "Velocity equals the ratio of distance to time", variables: { "v": "velocity (m/s)", "S": "distance (m)", "t": "time (s)" }, unit: "m/s" },
    "f-2": { name: "Acceleration", description: "Acceleration equals the change in velocity per unit time", variables: { "a": "acceleration (m/s²)", "v": "final velocity", "v₀": "initial velocity", "t": "time" }, unit: "m/s²" },
    "f-3": { name: "Newton's Second Law", description: "Force equals mass times acceleration", variables: { "F": "force (N)", "m": "mass (kg)", "a": "acceleration (m/s²)" }, unit: "N" },
    "f-4": { name: "Gravitational Force", description: "Gravitational force equals mass times gravitational acceleration", variables: { "F": "force (N)", "m": "mass (kg)", "g": "gravitational acceleration (≈10 m/s²)" }, unit: "N" },
    "f-5": { name: "Momentum", description: "Momentum equals mass times velocity", variables: { "p": "momentum (kg·m/s)", "m": "mass (kg)", "v": "velocity (m/s)" }, unit: "kg·m/s" },
    "f-6": { name: "Kinetic Energy", description: "Kinetic energy of a body", variables: { "E": "energy (J)", "m": "mass (kg)", "v": "velocity (m/s)" }, unit: "J" },
    "f-7": { name: "Potential Energy", description: "Potential energy in gravitational field", variables: { "E": "energy (J)", "m": "mass (kg)", "g": "gravitational acceleration", "h": "height (m)" }, unit: "J" },
    "f-8": { name: "Work", description: "Mechanical work", variables: { "A": "work (J)", "F": "force (N)", "S": "displacement (m)", "α": "angle" }, unit: "J" },
    "f-9": { name: "Pendulum Period", description: "Period of a simple pendulum", variables: { "T": "period (s)", "l": "length (m)", "g": "gravitational acceleration" }, unit: "s" },
    "f-10": { name: "Centripetal Acceleration", description: "Acceleration in circular motion", variables: { "a": "acceleration (m/s²)", "v": "velocity (m/s)", "R": "radius (m)" }, unit: "m/s²" },
    "f-11": { name: "Quantity of Heat", description: "Heat needed for heating", variables: { "Q": "heat (J)", "c": "specific heat capacity", "m": "mass (kg)", "ΔT": "temperature change (K)" }, unit: "J" },
    "f-12": { name: "Ideal Gas Law", description: "Equation of state for an ideal gas", variables: { "p": "pressure (Pa)", "V": "volume (m³)", "ν": "amount of substance (mol)", "R": "gas constant", "T": "temperature (K)" }, unit: "J" },
    "f-13": { name: "Average Kinetic Energy", description: "Average molecular energy", variables: { "E": "energy (J)", "k": "Boltzmann constant", "T": "temperature (K)" }, unit: "J" },
    "f-14": { name: "First Law of Thermodynamics", description: "Energy conservation for thermal processes", variables: { "Q": "heat (J)", "ΔU": "internal energy change", "A": "work (J)" }, unit: "J" },
    "f-15": { name: "Heat Engine Efficiency", description: "Maximum efficiency (Carnot cycle)", variables: { "η": "efficiency", "T₁": "heater temperature (K)", "T₂": "cooler temperature (K)" }, unit: "%" },
    "f-16": { name: "Heat of Fusion", description: "Heat for melting", variables: { "Q": "heat (J)", "λ": "specific heat of fusion (J/kg)", "m": "mass (kg)" }, unit: "J" },
    "f-17": { name: "Heat of Vaporization", description: "Heat for evaporation", variables: { "Q": "heat (J)", "L": "specific heat of vaporization", "m": "mass (kg)" }, unit: "J" },
    "f-18": { name: "Coulomb's Law", description: "Force between charges", variables: { "F": "force (N)", "k": "coefficient (9×10⁹)", "q": "charges (C)", "r": "distance (m)" }, unit: "N" },
    "f-19": { name: "Electric Field Strength", description: "Electric field strength", variables: { "E": "field strength (V/m)", "F": "force (N)", "q": "charge (C)" }, unit: "V/m" },
    "f-20": { name: "Ohm's Law", description: "Ohm's law for a circuit section", variables: { "I": "current (A)", "U": "voltage (V)", "R": "resistance (Ω)" }, unit: "A" },
    "f-21": { name: "Electric Power", description: "Power of electric current", variables: { "P": "power (W)", "U": "voltage (V)", "I": "current (A)" }, unit: "W" },
    "f-22": { name: "Capacitor Capacitance", description: "Electrical capacitance", variables: { "C": "capacitance (F)", "q": "charge (C)", "U": "voltage (V)" }, unit: "F" },
    "f-23": { name: "Ampere's Force", description: "Force on a current-carrying conductor", variables: { "F": "force (N)", "B": "induction (T)", "I": "current (A)", "L": "length (m)" }, unit: "N" },
    "f-24": { name: "Lorentz Force", description: "Force on a moving charge", variables: { "F": "force (N)", "q": "charge (C)", "v": "velocity (m/s)", "B": "induction (T)" }, unit: "N" },
    "f-25": { name: "Induced EMF", description: "Law of electromagnetic induction", variables: { "ε": "EMF (V)", "Φ": "magnetic flux (Wb)", "t": "time (s)" }, unit: "V" },
    "f-26": { name: "Capacitor Energy", description: "Energy of a charged capacitor", variables: { "W": "energy (J)", "C": "capacitance (F)", "U": "voltage (V)" }, unit: "J" },
    "f-27": { name: "Law of Reflection", description: "Angle of incidence equals angle of reflection", variables: { "α": "angle of incidence", "β": "angle of reflection" }, unit: "°" },
    "f-28": { name: "Law of Refraction", description: "Snell's law", variables: { "n": "refractive index", "α": "angle of incidence", "β": "angle of refraction" }, unit: "-" },
    "f-29": { name: "Lens Formula", description: "Thin lens formula", variables: { "F": "focal length (m)", "d": "object distance", "f": "image distance" }, unit: "m" },
    "f-30": { name: "Optical Power", description: "Optical power of a lens", variables: { "D": "optical power (dpt)", "F": "focal length (m)" }, unit: "dpt" },
    "f-31": { name: "Diffraction Grating", description: "Condition for diffraction maxima", variables: { "d": "grating period (m)", "φ": "diffraction angle", "k": "order", "λ": "wavelength (m)" }, unit: "m" },
    "f-32": { name: "Photon Energy", description: "Energy of a light quantum", variables: { "E": "energy (J)", "h": "Planck's constant", "ν": "frequency (Hz)" }, unit: "J" },
    "f-33": { name: "Photoelectric Equation", description: "Einstein's photoelectric equation", variables: { "h": "Planck's constant", "ν": "frequency", "A": "work function", "m": "electron mass", "v": "velocity" }, unit: "J" },
    "f-34": { name: "De Broglie Wavelength", description: "Particle wave", variables: { "λ": "wavelength (m)", "h": "Planck's constant", "p": "momentum (kg·m/s)" }, unit: "m" },
    "f-35": { name: "Binding Energy", description: "Nuclear binding energy", variables: { "E": "energy (J)", "Δm": "mass defect (kg)", "c": "speed of light" }, unit: "J" },
    "f-36": { name: "Radioactive Decay Law", description: "Number of undecayed nuclei", variables: { "N": "number of nuclei", "N₀": "initial number", "t": "time", "T": "half-life" }, unit: "-" },
    "f-37": { name: "Einstein's Formula", description: "Mass-energy equivalence", variables: { "E": "energy (J)", "m": "mass (kg)", "c": "speed of light (3×10⁸ m/s)" }, unit: "J" },
  },

  // ==================== TASKS ====================
  tasks: {
    "task-1": { title: "Train Speed", question: "A train traveled 180 km in 2 hours. What is the average speed?", options: ["60 km/h", "90 km/h", "120 km/h", "45 km/h"], explanation: "v = S/t = 180/2 = 90 km/h" },
    "task-2": { title: "Car Acceleration", question: "A car accelerates from 0 to 72 km/h in 8 seconds. Find the acceleration.", options: ["2.5 m/s²", "9 m/s²", "1.5 m/s²", "5 m/s²"], explanation: "72 km/h = 20 m/s. a = v/t = 20/8 = 2.5 m/s²" },
    "task-3": { title: "Gravity", question: "What is the gravitational force on a body of mass 5 kg?", options: ["5 N", "50 N", "0.5 N", "500 N"], explanation: "F = mg = 5 × 10 = 50 N" },
    "task-4": { title: "Kinetic Energy", question: "Find the kinetic energy of a body of mass 2 kg moving at 10 m/s.", options: ["20 J", "100 J", "200 J", "50 J"], explanation: "E = mv²/2 = 2 × 100 / 2 = 100 J" },
    "task-5": { title: "Potential Energy", question: "A body of mass 4 kg is lifted to a height of 5 m. Find its potential energy.", options: ["20 J", "200 J", "100 J", "400 J"], explanation: "E = mgh = 4 × 10 × 5 = 200 J" },
    "task-6": { title: "Momentum", question: "What is the momentum of a body of mass 3 kg moving at 4 m/s?", options: ["7 kg·m/s", "12 kg·m/s", "1.3 kg·m/s", "0.75 kg·m/s"], explanation: "p = mv = 3 × 4 = 12 kg·m/s" },
    "task-7": { title: "Quantity of Heat", question: "How much heat is needed to heat 2 kg of water by 25°C? (c = 4200 J/kg·°C)", options: ["210 kJ", "105 kJ", "420 kJ", "52.5 kJ"], explanation: "Q = cmΔT = 4200 × 2 × 25 = 210,000 J = 210 kJ" },
    "task-8": { title: "Ideal Gas", question: "During isothermal compression, the gas volume decreased by half. How did the pressure change?", options: ["Decreased by half", "Doubled", "Unchanged", "Quadrupled"], explanation: "By Boyle's law pV = const, when V halves, p doubles" },
    "task-9": { title: "Heat Engine Efficiency", question: "Heater temperature 400 K, cooler 300 K. Find the maximum efficiency.", options: ["75%", "25%", "50%", "33%"], explanation: "η = (T₁-T₂)/T₁ = (400-300)/400 = 0.25 = 25%" },
    "task-10": { title: "Temperature in Kelvins", question: "What is 27°C on the Kelvin scale?", options: ["300 K", "246 K", "273 K", "27 K"], explanation: "T = t + 273 = 27 + 273 = 300 K" },
    "task-11": { title: "Ohm's Law", question: "Current in the circuit is 2 A, resistance is 10 Ω. Find the voltage.", options: ["5 V", "20 V", "0.2 V", "12 V"], explanation: "U = IR = 2 × 10 = 20 V" },
    "task-12": { title: "Electric Power", question: "What is the power at 220 V voltage and 5 A current?", options: ["44 W", "1100 W", "225 W", "45 W"], explanation: "P = UI = 220 × 5 = 1100 W" },
    "task-13": { title: "Resistor Connection", question: "Two 6 Ω resistors are connected in parallel. What is the total resistance?", options: ["12 Ω", "3 Ω", "6 Ω", "0.33 Ω"], explanation: "1/R = 1/6 + 1/6 = 1/3, R = 3 Ω" },
    "task-14": { title: "Coulomb's Law", question: "How will the force between two charges change if the distance is tripled?", options: ["Decrease 3×", "Decrease 9×", "Increase 9×", "Unchanged"], explanation: "F ~ 1/r², when r triples, F decreases 9 times" },
    "task-15": { title: "Speed of Light in Water", question: "Find the speed of light in water if n = 1.33.", options: ["2.26×10⁸ m/s", "4×10⁸ m/s", "3×10⁸ m/s", "1.5×10⁸ m/s"], explanation: "v = c/n = 3×10⁸/1.33 ≈ 2.26×10⁸ m/s" },
    "task-16": { title: "Optical Power", question: "Focal length of a lens is 25 cm. Find the optical power.", options: ["25 dpt", "0.04 dpt", "4 dpt", "2.5 dpt"], explanation: "D = 1/F = 1/0.25 = 4 dpt" },
    "task-17": { title: "Law of Reflection", question: "The angle of incidence on a flat mirror is 30°. What is the angle between the incident and reflected rays?", options: ["30°", "60°", "90°", "15°"], explanation: "Incidence angle = reflection angle = 30°. Angle between rays = 30° + 30° = 60°" },
    "task-18": { title: "Photon Energy", question: "Find the photon energy at frequency 5×10¹⁴ Hz (h = 6.6×10⁻³⁴ J·s)", options: ["3.3×10⁻¹⁹ J", "3.3×10⁻²⁰ J", "7.5×10⁻⁴⁸ J", "1.3×10⁻¹⁹ J"], explanation: "E = hν = 6.6×10⁻³⁴ × 5×10¹⁴ = 3.3×10⁻¹⁹ J" },
    "task-19": { title: "Half-Life", question: "Half-life of an isotope is 8 days. What fraction remains after 24 days?", options: ["1/2", "1/4", "1/8", "1/3"], explanation: "24/8 = 3 half-lives. Remaining: 1/2³ = 1/8" },
    "task-20": { title: "Nuclear Structure", question: "How many neutrons in the ¹⁴N nucleus (nitrogen, Z=7)?", options: ["7", "14", "21", "0"], explanation: "N = A - Z = 14 - 7 = 7 neutrons" },
    "task-31": { title: "Lunar Phases", question: "Why does an observer on Earth see lunar phases?", options: ["Because the Earth-Moon distance changes", "Because the sunlit half of the Moon is seen under different angles", "Because Earth periodically eclipses the Moon", "Because the Moon emits its own light"], explanation: "Lunar phases arise from the changing geometry of the Sun, Earth, and Moon. We see different fractions of the illuminated half." },
    "task-32": { title: "Geostationary Satellite", question: "What condition is necessary for a geostationary satellite of Earth?", options: ["It moves on any elliptical orbit", "It is located above a pole", "Its period is 24 hours and the orbit lies in the equatorial plane", "Its speed equals the second cosmic velocity"], explanation: "A geostationary satellite must have a 24-hour period and stay on an equatorial circular orbit to remain above one point on Earth." },
    "task-33": { title: "Redshift", question: "What does the redshift of spectral lines from a distant galaxy mean?", options: ["The galaxy approaches the observer", "The galaxy moves away from the observer", "The galaxy has no motion relative to the observer", "The galaxy temperature has sharply increased"], explanation: "If spectral lines shift toward the red, the wavelength increases. For most distant galaxies this indicates recession." },
    "task-34": { title: "Telescope Resolution", question: "Which parameter most strongly improves a telescope's ability to distinguish nearby objects?", options: ["Increasing the diameter of the lens or mirror", "Reducing the telescope mass", "Changing the body color", "Reducing observation time"], explanation: "A larger aperture improves angular resolution, allowing finer details to be distinguished." },
    "task-35": { title: "Lorentz Factor", question: "What is the Lorentz factor γ for speed 0.6c?", options: ["0.8", "1.0", "1.25", "1.67"], explanation: "γ = 1 / sqrt(1 - v²/c²) = 1 / sqrt(1 - 0.36) = 1 / 0.8 = 1.25." },
    "task-36": { title: "Time Dilation", question: "If the proper time of a process is 2 μs and γ = 3, what time will an outside observer measure?", options: ["0.67 μs", "2 μs", "3 μs", "6 μs"], explanation: "For the outside observer moving clocks run slower: Δt = γΔt₀ = 3 × 2 μs = 6 μs." },
    "task-37": { title: "Length Contraction", question: "A rod has proper length 4 m. What length will an observer measure for γ = 2?", options: ["8 m", "4 m", "2 m", "1 m"], explanation: "Length along the motion contracts as L = L₀ / γ. Thus 4 / 2 = 2 m." },
    "task-38": { title: "Mass-Energy Equivalence", question: "What does the formula E = mc² express?", options: ["Mass is not related to energy", "A body's energy is proportional to its mass", "The speed of light depends on mass", "Momentum equals mass times acceleration"], explanation: "Einstein's formula expresses the equivalence of mass and energy: even a body at rest has energy E₀ = mc²." },
    "task-39": { title: "Light-Year", question: "What does the quantity '1 light-year' mean?", options: ["The period of Earth's revolution around the Sun", "The distance light travels in one year", "The average Earth-Moon distance", "The Sun's rotation period"], explanation: "A light-year is a unit of distance, not time. It is the path light travels in vacuum during one year." },
    "task-40": { title: "Stellar Parallax", question: "Why do astronomers measure the annual parallax of a star?", options: ["To determine its chemical composition", "To find the distance to the star", "To measure its age", "To compute the Sun's mass"], explanation: "Parallax gives the distance to relatively nearby stars from their apparent shift against distant background objects." },
    "task-41": { title: "Condition for a Solar Eclipse", question: "When can a solar eclipse occur?", options: ["When Earth is between the Sun and Moon", "When the Moon is between Earth and the Sun", "When the Sun is between Earth and Moon", "At any lunar phase"], explanation: "A solar eclipse happens when the Moon passes between Earth and the Sun and blocks part or all of the solar disk." },
    "task-42": { title: "Star Color and Temperature", question: "Which stars have higher average surface temperature?", options: ["Red stars", "Yellow stars", "Blue stars", "Orange stars"], explanation: "Blue and blue-white stars have higher surface temperatures than yellow or red stars." },
    "task-43": { title: "Interval for Light", question: "What is the spacetime interval for a light signal?", options: ["s > 0", "s < 0", "s = 0", "s = c"], explanation: "For light, the interval is s = 0. Light propagates along the light cone." },
    "task-44": { title: "Rest Energy", question: "How does a body's rest energy change if its mass doubles?", options: ["It halves", "It does not change", "It doubles", "It quadruples"], explanation: "Rest energy E₀ = mc² is directly proportional to mass. Doubling the mass doubles the rest energy." },
    "task-45": { title: "Simultaneity of Events", question: "How is the simultaneity of distant events treated in special relativity?", options: ["It is absolute for all observers", "It depends on the reference frame", "It exists only on Earth", "It depends only on the observer's mass"], explanation: "Simultaneity of distant events is relative: events simultaneous in one inertial frame may not be simultaneous in another." },
    "task-46": { title: "Relativistic Kinetic Energy", question: "How is the relativistic kinetic energy of a particle written?", options: ["K = mv²/2", "K = γmc²", "K = (γ - 1)mc²", "K = pc"], explanation: "Since total energy is E = γmc² and rest energy is E₀ = mc², kinetic energy is K = E - E₀ = (γ - 1)mc²." },
  },

  // ==================== TESTS ====================
  tests: testsEn,
};
