// English translations for all test questions
// Options order MUST match the original to preserve correct answer indices

import { TestTranslation } from '../translationTypes';

export const testsEn: Record<string, TestTranslation> = {
  // ==================== MECHANICS ====================
  // Basic (3)
  "mech-basic-1": {
    title: "Kinematics Basics",
    questions: [
      { question: "What is velocity?", options: ["Distance traveled per unit time", "Change in velocity", "Force per mass", "Energy of motion"] },
      { question: "Unit of velocity in SI?", options: ["km/h", "m/s", "m/min", "cm/s"] },
      { question: "Formula for distance in uniform motion?", options: ["S = v/t", "S = vt", "S = at²", "S = v²/a"] },
      { question: "In free fall g ≈ ?", options: ["1 m/s²", "10 m/s²", "100 m/s²", "5 m/s²"] },
      { question: "What is a trajectory?", options: ["Length of path", "Line of body's motion", "Velocity of body", "Time of motion"] },
    ]
  },
  "mech-basic-2": {
    title: "Forces in Nature",
    questions: [
      { question: "Unit of force in SI?", options: ["kg", "Newton", "Joule", "Pascal"] },
      { question: "Gravity is directed:", options: ["Upward", "Downward", "Horizontally", "Along the motion"] },
      { question: "Formula for gravitational force?", options: ["F = ma", "F = mg", "F = mv", "F = m/g"] },
      { question: "Elastic force occurs during:", options: ["Heating", "Deformation", "Cooling", "Rest"] },
      { question: "Friction force opposes:", options: ["Heating", "Motion", "Deformation", "Rotation"] },
    ]
  },
  "mech-basic-3": {
    title: "Energy and Work",
    questions: [
      { question: "Unit of energy in SI?", options: ["Watt", "Newton", "Joule", "Pascal"] },
      { question: "Kinetic energy is the energy of:", options: ["Position", "Motion", "Interaction", "Thermal"] },
      { question: "Work is measured in:", options: ["Watts", "Joules", "Newtons", "Meters"] },
      { question: "Formula for kinetic energy?", options: ["E = mgh", "E = mv²/2", "E = Fs", "E = pt"] },
      { question: "Potential energy depends on:", options: ["Velocity", "Height", "Time", "Acceleration"] },
    ]
  },
  // Standard (2)
  "mech-standard-1": {
    title: "Newton's Laws",
    questions: [
      { question: "Newton's first law describes:", options: ["Inertia of a body", "Acceleration of a body", "Action and reaction", "Energy of a system"] },
      { question: "Newton's second law: F = ?", options: ["mv", "mgh", "ma", "mv²/2"] },
      { question: "According to Newton's third law, F₁ and F₂:", options: ["Are equal and co-directed", "Are equal and opposite", "Are not equal", "Are perpendicular"] },
      { question: "A body of mass 2 kg moves with acceleration 3 m/s². The force is:", options: ["1.5 N", "5 N", "6 N", "0.67 N"] },
      { question: "Forces of 5 N and 3 N act on a body in opposite directions. The resultant:", options: ["8 N", "2 N", "15 N", "1.67 N"] },
      { question: "The inertia of a body is determined by its:", options: ["Velocity", "Mass", "Volume", "Density"] },
      { question: "The coefficient of friction is a quantity that is:", options: ["Always > 1", "Always < 1", "Dimensionless", "Has units of N"] },
    ]
  },
  "mech-standard-2": {
    title: "Momentum and Conservation Laws",
    questions: [
      { question: "Formula for body's momentum?", options: ["p = mv", "p = ma", "p = Ft", "p = mgh"] },
      { question: "Unit of momentum in SI?", options: ["N·s", "kg·m/s", "Both answers are correct", "J/s"] },
      { question: "The law of conservation of momentum holds in:", options: ["Any system", "An isolated system", "An open system", "Only at rest"] },
      { question: "Impulse of force equals:", options: ["ma", "FΔt", "mv²", "mgh"] },
      { question: "Two bodies after an inelastic collision:", options: ["Fly apart", "Move together", "Stop", "Change mass"] },
      { question: "A ball of mass 2 kg with velocity 3 m/s has momentum:", options: ["1.5 kg·m/s", "5 kg·m/s", "6 kg·m/s", "9 kg·m/s"] },
      { question: "Jet propulsion is based on the conservation of:", options: ["Energy", "Momentum", "Mass", "Charge"] },
    ]
  },
  // Advanced (2)
  "mech-advanced-1": {
    title: "Complex System Dynamics",
    questions: [
      { question: "A body of 5 kg on an inclined plane (angle 30°, μ=0.2). Sliding acceleration:", options: ["≈3.3 m/s²", "≈5 m/s²", "≈1.7 m/s²", "≈2.5 m/s²"] },
      { question: "A pendulum deflected 60° and released. Velocity at lowest point (l=1m):", options: ["√10 m/s", "√5 m/s", "√20 m/s", "10 m/s"] },
      { question: "Two bodies connected by a string over a pulley (m₁=3kg, m₂=2kg). System acceleration:", options: ["2 m/s²", "5 m/s²", "1 m/s²", "10 m/s²"] },
      { question: "Centripetal acceleration at v=10 m/s and R=5m:", options: ["2 m/s²", "20 m/s²", "50 m/s²", "0.5 m/s²"] },
      { question: "Satellite at orbit h=R_earth. First cosmic velocity:", options: ["≈5.6 km/s", "≈7.9 km/s", "≈11.2 km/s", "≈3.1 km/s"] },
      { question: "Moment of inertia of a disk about its axis:", options: ["MR²", "MR²/2", "2MR²/5", "MR²/4"] },
      { question: "Body thrown at 45° angle. Maximum range occurs at:", options: ["v₀ = max", "g = min", "Angle 45°", "All answers are correct"] },
      { question: "Work of friction force along a closed path:", options: ["= 0", "≠ 0", "Depends on the shape", "Always positive"] },
    ]
  },
  "mech-advanced-2": {
    title: "Oscillations and Waves",
    questions: [
      { question: "Period of a pendulum with l=1m:", options: ["≈1 s", "≈2 s", "≈0.5 s", "≈3 s"] },
      { question: "Period of a spring pendulum depends on:", options: ["Amplitude", "m and k", "Only k", "Only m"] },
      { question: "At resonance, the frequency of the driving force:", options: ["= 0", "= natural frequency", "> natural frequency", "< natural frequency"] },
      { question: "Wavelength λ at v=340 m/s and ν=170 Hz:", options: ["1 m", "2 m", "0.5 m", "4 m"] },
      { question: "Sound in water propagates:", options: ["Slower than in air", "Faster than in air", "At the same speed", "Does not propagate"] },
      { question: "Amplitude of damped oscillations:", options: ["Is constant", "Increases", "Decreases", "Oscillates"] },
      { question: "A standing wave is formed by:", options: ["Wave reflection", "Refraction", "Diffraction", "Dispersion"] },
      { question: "Equation of harmonic oscillations:", options: ["x = A·sin(ωt)", "x = A·t²", "x = v·t", "x = A/t"] },
    ]
  },
  // Olympiad (3)
  "mech-olympiad-1": {
    title: "Olympiad Mechanics I",
    questions: [
      { question: "A ball rolls down an incline without slipping. What fraction of energy goes to rotation?", options: ["1/7", "2/7", "2/5", "1/3"] },
      { question: "A wedge of mass M can move horizontally without friction. A body m slides off it. Wedge acceleration:", options: ["mg·sinα·cosα/(M+m·sin²α)", "mg·sinα/(M+m)", "g·sinα", "0"] },
      { question: "A cylinder rolls horizontally with velocity v. Velocity of the top point:", options: ["v", "2v", "0", "v√2"] },
      { question: "A body at the equator weighs less than at the pole because of:", options: ["Earth's flattening", "Earth's rotation", "Both factors", "Atmospheric pressure"] },
      { question: "Two satellites in circular orbits R and 4R. Period ratio T₂/T₁:", options: ["2", "4", "8", "16"] },
      { question: "A rod of length L rotates about its end. Moment of inertia:", options: ["ML²/3", "ML²/12", "ML²/2", "ML²"] },
      { question: "Perfectly elastic collision of two identical balls results in:", options: ["Velocity exchange", "Both stop", "Move together", "Scatter at 90°"] },
      { question: "A gyroscope maintains axis direction due to:", options: ["Friction", "Angular momentum", "Centrifugal force", "Gravity"] },
      { question: "The Coriolis effect is related to:", options: ["Gravity", "Rotation of the reference frame", "Friction", "Elasticity"] },
      { question: "Suspension point of a physical pendulum giving minimum period:", options: ["Center of mass", "Center of oscillation", "Any point", "Does not exist"] },
    ]
  },
  "mech-olympiad-2": {
    title: "Olympiad Mechanics II",
    questions: [
      { question: "An astronaut in open space throws an object. What happens?", options: ["Both fly in opposite directions", "Object flies away, astronaut stays", "Nothing", "Both fly in the same direction"] },
      { question: "A body thrown vertically upward. At the top point, acceleration:", options: ["0", "g downward", "g upward", "Depends on mass"] },
      { question: "An elevator falls with acceleration g/2. Weight of a body of mass m:", options: ["mg", "mg/2", "2mg", "0"] },
      { question: "Newton's second law in the relativistic case:", options: ["F = ma", "F = dp/dt", "F = mv", "Does not apply"] },
      { question: "A figure skater spinning pulls arms in. Angular velocity:", options: ["Decreases", "Increases", "Does not change", "Becomes zero"] },
      { question: "Foucault's pendulum proves:", options: ["Earth is spherical", "Earth's rotation", "Law of gravitation", "Conservation of energy"] },
      { question: "Tides on Earth are caused by:", options: ["Earth's rotation", "Moon's gravity", "Solar wind", "Atmospheric pressure"] },
      { question: "When a car brakes, a passenger leans forward due to:", options: ["Friction", "Inertia", "Gravity", "Centrifugal force"] },
      { question: "Weightlessness on the ISS is explained by:", options: ["Absence of gravity", "Free fall", "High altitude", "Vacuum"] },
      { question: "The twin paradox is related to:", options: ["Gravity", "Relativity of time", "Quantum mechanics", "Thermodynamics"] },
    ]
  },
  "mech-olympiad-3": {
    title: "Olympiad Mechanics III",
    questions: [
      { question: "The Steiner theorem relates:", options: ["Angular momentum", "Moments of inertia about different axes", "Energy and work", "Force and acceleration"] },
      { question: "D'Alembert's principle introduces:", options: ["Inertial force", "Gravitational force", "Friction force", "Elastic force"] },
      { question: "Lagrange's equations use:", options: ["Cartesian coordinates", "Generalized coordinates", "Polar coordinates", "Only time"] },
      { question: "Relation between L and ω for a rigid body:", options: ["L = mω", "L = Iω", "L = ω/I", "L = I/ω"] },
      { question: "A particle in potential well U = kx². The motion is:", options: ["Uniform", "Harmonic", "Uniformly accelerated", "Chaotic"] },
      { question: "A satellite's orbit is an ellipse according to:", options: ["Hooke's law", "Kepler's laws", "Archimedes' law", "Pascal's law"] },
      { question: "In an elastic collision, the following is conserved:", options: ["Only momentum", "Only energy", "Momentum and kinetic energy", "Nothing"] },
      { question: "Phase portrait of an oscillator is:", options: ["A straight line", "An ellipse", "A parabola", "A hyperbola"] },
      { question: "Lagrange point L1 is located:", options: ["Between the bodies", "Behind the smaller body", "Behind the larger body", "Perpendicular to the orbit"] },
      { question: "Number of degrees of freedom of a CO₂ molecule:", options: ["3", "5", "6", "9"] },
    ]
  },

  // ==================== THERMODYNAMICS ====================
  // Basic (3)
  "therm-basic-1": {
    title: "Temperature and Heat",
    questions: [
      { question: "Absolute zero equals:", options: ["-273°C", "0°C", "273°C", "-100°C"] },
      { question: "Unit of temperature in SI?", options: ["Degree Celsius", "Kelvin", "Fahrenheit", "Joule"] },
      { question: "Heat is transferred from:", options: ["Cold to hot", "Hot to cold", "In any direction", "Is not transferred"] },
      { question: "Formula T(K) = ?", options: ["t - 273", "t + 273", "t × 273", "t / 273"] },
      { question: "27°C = ? K", options: ["300 K", "246 K", "27 K", "273 K"] },
    ]
  },
  "therm-basic-2": {
    title: "States of Matter",
    questions: [
      { question: "During melting, temperature:", options: ["Rises", "Falls", "Remains constant", "Fluctuates"] },
      { question: "Evaporation occurs:", options: ["Only during boiling", "At any temperature", "Only at 100°C", "Only in vacuum"] },
      { question: "During condensation, heat:", options: ["Is absorbed", "Is released", "Does not change", "Disappears"] },
      { question: "Sublimation is a transition:", options: ["Solid → liquid", "Liquid → gas", "Solid → gas", "Gas → liquid"] },
      { question: "Boiling point of water at 1 atm:", options: ["0°C", "50°C", "100°C", "273°C"] },
    ]
  },
  "therm-basic-3": {
    title: "Thermal Phenomena",
    questions: [
      { question: "Thermal conductivity is better in:", options: ["Wood", "Metal", "Air", "Plastic"] },
      { question: "Convection is possible in:", options: ["Solids", "Liquids and gases", "Only in gases", "In vacuum"] },
      { question: "Radiation propagates:", options: ["Only in matter", "Only in vacuum", "In matter and vacuum", "Does not propagate"] },
      { question: "Specific heat capacity of water:", options: ["420 J/kg·K", "4200 J/kg·K", "42000 J/kg·K", "42 J/kg·K"] },
      { question: "Formula for the amount of heat:", options: ["Q = mv²", "Q = cmΔT", "Q = mgh", "Q = Fs"] },
    ]
  },
  // Standard (2)
  "therm-standard-1": {
    title: "Gas Laws",
    questions: [
      { question: "Ideal gas law (Mendeleev-Clapeyron equation):", options: ["pV = νRT", "pV = const", "p/T = const", "V/T = const"] },
      { question: "In an isothermal process:", options: ["T = const", "p = const", "V = const", "Q = 0"] },
      { question: "Boyle's law:", options: ["pV = const (T = const)", "p/T = const", "V/T = const", "pT = const"] },
      { question: "During isobaric heating, volume:", options: ["Decreases", "Increases", "Does not change", "First increases, then decreases"] },
      { question: "R (gas constant) ≈", options: ["8.31 J/(mol·K)", "6.02×10²³", "1.38×10⁻²³ J/K", "3×10⁸ m/s"] },
      { question: "During isochoric heating, pressure:", options: ["Decreases", "Increases", "Does not change", "Oscillates"] },
      { question: "An adiabatic process is a process without:", options: ["Work", "Heat exchange", "Change in T", "Change in p"] },
    ]
  },
  "therm-standard-2": {
    title: "Laws of Thermodynamics",
    questions: [
      { question: "First law of thermodynamics:", options: ["Q = ΔU + A", "ΔS ≥ 0", "pV = νRT", "E = mc²"] },
      { question: "The second law prohibits:", options: ["Heating", "Perpetual motion machine of the 2nd kind", "Heat transfer", "Work"] },
      { question: "Efficiency of an ideal heat engine:", options: ["η = 1", "η = (T₁-T₂)/T₁", "η = T₂/T₁", "η = A/Q₂"] },
      { question: "Internal energy of an ideal gas depends on:", options: ["Only V", "Only p", "Only T", "p and V"] },
      { question: "During adiabatic expansion, the gas:", options: ["Heats up", "Cools down", "Does not change T", "Condenses"] },
      { question: "Entropy of an isolated system:", options: ["Decreases", "Increases or remains constant", "Is always constant", "Fluctuates"] },
      { question: "The Carnot cycle consists of:", options: ["2 isotherms and 2 adiabats", "4 isobars", "4 isochores", "2 isobars and 2 isochores"] },
    ]
  },
  // Advanced (2)
  "therm-advanced-1": {
    title: "MKT and Statistics",
    questions: [
      { question: "Average kinetic energy of a molecule:", options: ["E = kT", "E = 3kT/2", "E = kT/2", "E = 2kT"] },
      { question: "Avogadro's number N_A ≈", options: ["6.02×10²³ mol⁻¹", "1.38×10⁻²³ J/K", "8.31 J/(mol·K)", "3×10⁸ m/s"] },
      { question: "Root-mean-square velocity of molecules:", options: ["v = √(3kT/m)", "v = √(2kT/m)", "v = kT/m", "v = 3kT/m"] },
      { question: "Ideal gas pressure p = ?", options: ["nkT", "nm<v²>/3", "Both answers are correct", "NkT/V"] },
      { question: "Degrees of freedom of a diatomic gas:", options: ["3", "5", "6", "7"] },
      { question: "Internal energy of one mole of monatomic gas:", options: ["3RT/2", "5RT/2", "RT", "7RT/2"] },
      { question: "Maxwell distribution describes:", options: ["Energy", "Molecular velocities", "Pressure", "Temperature"] },
      { question: "Mean free path depends on:", options: ["T and p", "Only p", "Only T", "Molecular mass"] },
    ]
  },
  "therm-advanced-2": {
    title: "Real Gases and Phase Transitions",
    questions: [
      { question: "Van der Waals equation accounts for:", options: ["Molecular volume and interaction", "Only volume", "Only interaction", "Quantum effects"] },
      { question: "Critical point is where:", options: ["Ice melts", "Liquid-gas boundary disappears", "Water boils", "Gas liquefies"] },
      { question: "Triple point of water:", options: ["0°C, 1 atm", "100°C, 1 atm", "0.01°C, 611 Pa", "273 K, 0 Pa"] },
      { question: "Heat of vaporization of water ≈", options: ["330 kJ/kg", "2260 kJ/kg", "4200 kJ/kg", "80 kJ/kg"] },
      { question: "Compressing gas above critical temperature:", options: ["Liquid forms", "No liquid forms", "Solid forms", "Explosion occurs"] },
      { question: "Saturated vapor is vapor in:", options: ["Vacuum", "Equilibrium with liquid", "Superheated state", "Supercooled state"] },
      { question: "Air humidity is measured with:", options: ["Thermometer", "Psychrometer", "Barometer", "Manometer"] },
      { question: "Joule-Thomson effect is:", options: ["Heating during compression", "Cooling during expansion through a porous plug", "Boiling", "Condensation"] },
    ]
  },
  // Olympiad (3)
  "therm-olympiad-1": {
    title: "Olympiad Thermodynamics I",
    questions: [
      { question: "Heat capacity at constant pressure C_p and at constant volume C_v are related:", options: ["C_p = C_v", "C_p > C_v", "C_p < C_v", "Not related"] },
      { question: "For an ideal gas C_p - C_v = ?", options: ["R", "R/2", "2R", "0"] },
      { question: "Adiabatic index γ = ?", options: ["C_v/C_p", "C_p/C_v", "C_p + C_v", "C_p - C_v"] },
      { question: "In an adiabatic process TV^(γ-1) = ?", options: ["const", "T", "V", "p"] },
      { question: "Gas work in an isobaric process:", options: ["p(V₂-V₁)", "νRΔT", "Both answers are correct", "pV"] },
      { question: "A polytropic process is a process with:", options: ["Constant heat capacity", "Constant T", "Constant p", "Constant V"] },
      { question: "Entropy S = ?", options: ["Q/T", "∫dQ/T", "kln(W)", "All answers are related"] },
      { question: "Third law of thermodynamics:", options: ["As T→0, S→0", "ΔS ≥ 0", "Q = ΔU + A", "pV = νRT"] },
      { question: "Helmholtz free energy F = ?", options: ["U - TS", "U + pV", "H - TS", "U + TS"] },
      { question: "Enthalpy H = ?", options: ["U - pV", "U + pV", "U - TS", "U + TS"] },
    ]
  },
  "therm-olympiad-2": {
    title: "Olympiad Thermodynamics II",
    questions: [
      { question: "Thermal conductivity of gas at low pressures:", options: ["Increases with p", "Does not depend on p", "Decreases with p", "Proportional to p²"] },
      { question: "Viscosity of gas upon heating:", options: ["Increases", "Decreases", "Does not change", "Oscillates"] },
      { question: "Diffusion is the transfer of:", options: ["Heat", "Mass", "Momentum", "Charge"] },
      { question: "Knudsen number characterizes:", options: ["Turbulence", "Gas rarefaction", "Thermal conductivity", "Viscosity"] },
      { question: "Brownian motion proves:", options: ["Existence of atoms", "Conservation of energy", "Second law of thermodynamics", "Equation of state"] },
      { question: "Fluctuations of quantity X ~ ?", options: ["√N", "N", "N²", "1/N"] },
      { question: "Statistical weight of a system W is:", options: ["Number of microstates", "Energy", "Entropy", "Temperature"] },
      { question: "Boltzmann distribution: n ~ exp(?)", options: ["-E/kT", "E/kT", "-kT/E", "kT/E"] },
      { question: "Heat capacity of a solid as T→0:", options: ["Is constant", "Tends to 0", "Tends to ∞", "Oscillates"] },
      { question: "Dulong-Petit law:", options: ["C ≈ 3R per mole", "C = 0 at T = 0", "C ~ T³", "C ~ T"] },
    ]
  },
  "therm-olympiad-3": {
    title: "Olympiad Thermodynamics III",
    questions: [
      { question: "Blackbody radiation is described by:", options: ["Stefan-Boltzmann law", "Planck's formula", "Wien's law", "All of the above"] },
      { question: "Stefan-Boltzmann law: P ~ ?", options: ["T", "T²", "T³", "T⁴"] },
      { question: "Wien's displacement law: λ_max ~ ?", options: ["T", "1/T", "T²", "√T"] },
      { question: "The ultraviolet catastrophe is related to:", options: ["Classical radiation theory", "Quantum mechanics", "Thermodynamics", "Kinetic theory"] },
      { question: "A phonon is a quantum of:", options: ["Light", "Lattice vibrations", "Electric field", "Magnetic field"] },
      { question: "Bose gas at T→0:", options: ["Condenses", "Expands", "Heats up", "Crystallizes"] },
      { question: "Fermi gas is characterized by:", options: ["Pauli principle", "Bose condensation", "Classical distribution", "Maxwell distribution"] },
      { question: "Superfluidity of helium-4 is a manifestation of:", options: ["Bose condensation", "Superconductivity", "Fermi liquid", "Classical mechanics"] },
      { question: "Pressure of a photon gas p = ?", options: ["u/3", "u", "3u", "u/2"] },
      { question: "Negative absolute temperature is possible in:", options: ["Equilibrium systems", "Systems with population inversion", "Impossible in principle", "Any systems"] },
    ]
  },

  // ==================== ELECTROMAGNETISM ====================
  // Basic (3)
  "em-basic-1": {
    title: "Electric Charge",
    questions: [
      { question: "Unit of charge in SI:", options: ["Ampere", "Volt", "Coulomb", "Ohm"] },
      { question: "Like charges:", options: ["Attract", "Repel", "Do not interact", "Neutralize"] },
      { question: "Charge of an electron:", options: ["+1.6×10⁻¹⁹ C", "-1.6×10⁻¹⁹ C", "0", "1 C"] },
      { question: "The law of conservation of charge states:", options: ["Charge is created", "Charge disappears", "Charge is conserved", "Charge changes"] },
      { question: "Conductors differ from insulators by:", options: ["Mass", "Presence of free charges", "Color", "Shape"] },
    ]
  },
  "em-basic-2": {
    title: "Electric Current",
    questions: [
      { question: "Current is measured in:", options: ["Volts", "Ohms", "Amperes", "Watts"] },
      { question: "Formula for current:", options: ["I = U/R", "I = q/t", "Both answers are correct", "I = Rt"] },
      { question: "Voltage is measured in:", options: ["Amperes", "Volts", "Ohms", "Joules"] },
      { question: "Resistance is measured in:", options: ["Amperes", "Volts", "Ohms", "Watts"] },
      { question: "Ohm's law: I = ?", options: ["UR", "U/R", "R/U", "U+R"] },
    ]
  },
  "em-basic-3": {
    title: "Magnetic Field",
    questions: [
      { question: "Magnetic field is created by:", options: ["Stationary charges", "Moving charges", "Mass", "Heat"] },
      { question: "Unit of magnetic induction:", options: ["Volt", "Ampere", "Tesla", "Henry"] },
      { question: "Magnetic field lines are:", options: ["Open", "Closed", "Straight", "Non-existent"] },
      { question: "A magnet has:", options: ["One pole", "Two poles", "Three poles", "No poles"] },
      { question: "A compass points to:", options: ["South", "East", "North", "West"] },
    ]
  },
  // Standard (2)
  "em-standard-1": {
    title: "Electrostatics",
    questions: [
      { question: "Coulomb's law: F = ?", options: ["kq₁q₂/r", "kq₁q₂/r²", "kq₁q₂r", "kq₁q₂r²"] },
      { question: "Electric field intensity E = ?", options: ["F/q", "Fq", "F+q", "F-q"] },
      { question: "Potential φ = ?", options: ["W/q", "Wq", "W+q", "W-q"] },
      { question: "Capacitance of a capacitor C = ?", options: ["q/U", "qU", "U/q", "q+U"] },
      { question: "Energy of a capacitor W = ?", options: ["CU²/2", "CU", "C/U", "C²U"] },
      { question: "For capacitors in series:", options: ["C = C₁ + C₂", "1/C = 1/C₁ + 1/C₂", "C = C₁C₂", "C = C₁/C₂"] },
      { question: "Dielectric constant of water ≈", options: ["1", "80", "8", "800"] },
    ]
  },
  "em-standard-2": {
    title: "Direct Current",
    questions: [
      { question: "Electric power P = ?", options: ["UI", "U/I", "I/U", "U+I"] },
      { question: "Work of current A = ?", options: ["UIt", "UI/t", "Ut/I", "It/U"] },
      { question: "Joule-Lenz law: Q = ?", options: ["I²Rt", "IR²t", "IRt²", "I²R²t"] },
      { question: "For resistors in series:", options: ["R = R₁ + R₂", "1/R = 1/R₁ + 1/R₂", "R = R₁R₂", "R = R₁/R₂"] },
      { question: "For resistors in parallel:", options: ["R = R₁ + R₂", "1/R = 1/R₁ + 1/R₂", "R = R₁R₂", "R = R₁ - R₂"] },
      { question: "EMF of a source is:", options: ["Voltage across the load", "Work done moving a charge", "Resistance", "Power"] },
      { question: "Ohm's law for a complete circuit:", options: ["I = ε/(R+r)", "I = ε/R", "I = εR", "I = ε + R"] },
    ]
  },
  // Advanced (2)
  "em-advanced-1": {
    title: "Electromagnetic Induction",
    questions: [
      { question: "Faraday's law: ε = ?", options: ["-dΦ/dt", "dΦ/dt", "Φ/t", "Φt"] },
      { question: "Lenz's rule determines:", options: ["Magnitude of EMF", "Direction of induced current", "Resistance", "Power"] },
      { question: "Inductance is measured in:", options: ["Farads", "Henrys", "Teslas", "Webers"] },
      { question: "Energy of a coil's magnetic field:", options: ["LI²/2", "LI", "L/I", "L²I"] },
      { question: "Eddy currents (Foucault currents) arise in:", options: ["Thin wires", "Massive conductors", "Dielectrics", "Vacuum"] },
      { question: "Self-induction opposes:", options: ["Change in current", "Constant current", "Voltage", "Resistance"] },
      { question: "A transformer operates on:", options: ["Direct current", "Alternating current", "Any current", "Does not operate"] },
      { question: "Transformer ratio K = ?", options: ["N₁/N₂", "N₂/N₁", "N₁N₂", "N₁+N₂"] },
    ]
  },
  "em-advanced-2": {
    title: "Alternating Current and Oscillations",
    questions: [
      { question: "RMS current I = ?", options: ["I₀", "I₀/√2", "I₀√2", "I₀/2"] },
      { question: "Resonance in a circuit occurs when:", options: ["ω = 1/√LC", "ω = LC", "ω = √LC", "ω = L/C"] },
      { question: "Impedance of a circuit Z = ?", options: ["√(R² + (XL-XC)²)", "R + XL + XC", "R × XL × XC", "R/(XL+XC)"] },
      { question: "Inductive reactance XL = ?", options: ["ωL", "1/ωL", "ωC", "1/ωC"] },
      { question: "Capacitive reactance XC = ?", options: ["ωC", "1/ωC", "ωL", "1/ωL"] },
      { question: "Power factor cosφ:", options: ["= 1 at resonance", "< 1 always", "> 1 is possible", "= 0 at resonance"] },
      { question: "Mains frequency in Russia:", options: ["60 Hz", "50 Hz", "100 Hz", "25 Hz"] },
      { question: "Quality factor Q characterizes:", options: ["Damping", "Power", "Voltage", "Resistance"] },
    ]
  },
  // Olympiad (3)
  "em-olympiad-1": {
    title: "Olympiad Electricity I",
    questions: [
      { question: "Maxwell's equations describe:", options: ["Only electrostatics", "Only magnetostatics", "All of classical electrodynamics", "Quantum mechanics"] },
      { question: "Displacement current was introduced for:", options: ["Elegance", "Charge conservation and current continuity", "Simplification", "No reason"] },
      { question: "Poynting vector S = ?", options: ["E × H", "E · H", "E + H", "E - H"] },
      { question: "Skin effect is:", options: ["Current pushed to the surface", "Current amplification", "Magnetic field weakening", "Heating"] },
      { question: "An electromagnetic wave is a wave that is:", options: ["Longitudinal", "Transverse", "Mixed", "Standing"] },
      { question: "Speed of light c = ?", options: ["1/√εμ", "1/√(ε₀μ₀)", "√(ε₀μ₀)", "ε₀μ₀"] },
      { question: "Polarization of light is:", options: ["Absorption", "Reflection", "Ordering of E oscillations", "Diffraction"] },
      { question: "Biot-Savart-Laplace law describes:", options: ["Magnetic field of a current", "Electric field of a charge", "Induction", "Resistance"] },
      { question: "Lorentz force F = ?", options: ["qvB", "q[v×B]", "qv×B sinα", "All answers are related"] },
      { question: "The Hall effect allows determining:", options: ["Sign of charge carriers", "Electron mass", "Proton charge", "Speed of light"] },
    ]
  },
  "em-olympiad-2": {
    title: "Olympiad Electricity II",
    questions: [
      { question: "Gauss's theorem relates:", options: ["E flux through a surface and charge inside", "E circulation and magnetic flux", "E and B", "Current and voltage"] },
      { question: "Circulation of E in electrostatics:", options: ["= 0", "≠ 0", "= q/ε₀", "= ∞"] },
      { question: "Circulation of B by Ampere's law:", options: ["= 0", "= μ₀I", "= q/ε₀", "= ∞"] },
      { question: "Boundary conditions for normal component of D:", options: ["D₁n = D₂n", "D₁n ≠ D₂n", "D = 0", "D = ∞"] },
      { question: "Field inside a conductor in statics:", options: ["Maximum", "= 0", "Constant", "Oscillates"] },
      { question: "Method of images is used for:", options: ["Calculating capacitance", "Solving boundary problems", "Measuring current", "Heating"] },
      { question: "Energy of electric field w = ?", options: ["ε₀E²/2", "E²/2ε₀", "εE/2", "ε₀E"] },
      { question: "Energy of magnetic field w = ?", options: ["B²/2μ₀", "μ₀B²/2", "B/2μ₀", "μ₀B"] },
      { question: "Momentum of electromagnetic field p = ?", options: ["S/c²", "Sc²", "S/c", "Sc"] },
      { question: "Light pressure on a surface:", options: ["Exists", "Does not exist", "Only upon reflection", "Only upon absorption"] },
    ]
  },
  "em-olympiad-3": {
    title: "Olympiad Electricity III",
    questions: [
      { question: "Superconductivity is:", options: ["Very low resistance", "Zero resistance", "Negative resistance", "Infinite resistance"] },
      { question: "Meissner effect is:", options: ["Expulsion of magnetic field from a superconductor", "Field attraction", "Field amplification", "Nothing"] },
      { question: "Cooper pairs are:", options: ["Pairs of electrons in a superconductor", "Pairs of protons", "Pairs of photons", "Pairs of magnets"] },
      { question: "Magnetic flux quantization means:", options: ["Φ = nΦ₀", "Φ = 0", "Φ = ∞", "Φ is continuous"] },
      { question: "Josephson effect is related to:", options: ["Tunneling of Cooper pairs", "Resonance", "Induction", "Capacitance"] },
      { question: "Plasma is:", options: ["A solid", "An ionized gas", "A liquid", "Superfluid helium"] },
      { question: "Plasma oscillation frequency depends on:", options: ["Electron concentration", "Temperature", "Pressure", "Volume"] },
      { question: "Magnetic confinement of plasma is used in:", options: ["Tokamaks", "Light bulbs", "Capacitors", "Transformers"] },
      { question: "Cherenkov radiation occurs when:", options: ["v > c in medium", "v < c", "v = 0", "v = c"] },
      { question: "Synchrotron radiation is produced by:", options: ["Accelerated charged particles", "Stationary charges", "Neutrons", "Photons"] },
    ]
  },

  // ==================== OPTICS ====================
  // Basic (3)
  "opt-basic-1": {
    title: "Light and Its Properties",
    questions: [
      { question: "Speed of light in vacuum:", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "300 m/s"] },
      { question: "Light propagates:", options: ["Only in matter", "Only in vacuum", "In matter and vacuum", "Nowhere"] },
      { question: "White light consists of:", options: ["One color", "All colors of the spectrum", "Only red and blue", "Invisible rays"] },
      { question: "Shadow is formed due to:", options: ["Refraction", "Rectilinear propagation", "Diffraction", "Interference"] },
      { question: "A light source that emits on its own:", options: ["Moon", "Sun", "Mirror", "White wall"] },
    ]
  },
  "opt-basic-2": {
    title: "Reflection and Refraction",
    questions: [
      { question: "Angle of incidence equals the angle of:", options: ["Refraction", "Reflection", "Scattering", "Diffraction"] },
      { question: "When entering a denser medium, light:", options: ["Speeds up", "Slows down", "Does not change speed", "Disappears"] },
      { question: "Specular reflection occurs from:", options: ["Rough surface", "Smooth surface", "Any surface", "Only from metal"] },
      { question: "Refractive index of water ≈", options: ["1", "1.33", "2", "0.5"] },
      { question: "Rainbow occurs due to:", options: ["Reflection", "Refraction and dispersion", "Diffraction", "Interference"] },
    ]
  },
  "opt-basic-3": {
    title: "Lenses and Optical Instruments",
    questions: [
      { question: "A converging lens:", options: ["Thinner at edges", "Thicker at edges", "Uniform thickness", "Has no shape"] },
      { question: "Focus of a lens is the point where:", options: ["Rays diverge", "Parallel rays converge", "Rays disappear", "Rays change color"] },
      { question: "Optical power is measured in:", options: ["Meters", "Diopters", "Joules", "Watts"] },
      { question: "A magnifying glass is a lens that is:", options: ["Diverging", "Converging", "Flat", "Cylindrical"] },
      { question: "The human eye is an optical system with a lens that is:", options: ["Diverging", "Converging", "Absent", "Flat"] },
    ]
  },
  // Standard (2)
  "opt-standard-1": {
    title: "Geometric Optics",
    questions: [
      { question: "Snell's law of refraction:", options: ["n₁sinα = n₂sinβ", "n₁cosα = n₂cosβ", "n₁α = n₂β", "sinα = sinβ"] },
      { question: "Thin lens formula:", options: ["1/F = 1/d + 1/f", "F = d + f", "F = df", "1/F = 1/d - 1/f"] },
      { question: "Total internal reflection occurs at:", options: ["Any angle", "Angle greater than critical", "Angle equal to 0°", "Angle 90°"] },
      { question: "Critical angle for water (n=1.33):", options: ["≈49°", "≈90°", "≈0°", "≈30°"] },
      { question: "Magnification of a lens Γ = ?", options: ["f/d", "d/f", "d+f", "d-f"] },
      { question: "A microscope gives magnification:", options: ["Γ = Γ_obj × Γ_eye", "Γ = Γ_obj + Γ_eye", "Γ = Γ_obj / Γ_eye", "Γ = Γ_obj - Γ_eye"] },
      { question: "Lens aberrations are:", options: ["Image distortions", "Quality improvement", "Brightness increase", "Color change"] },
    ]
  },
  "opt-standard-2": {
    title: "Wave Optics",
    questions: [
      { question: "Interference is:", options: ["Superposition of waves", "Bending around obstacles", "Decomposition into spectrum", "Polarization"] },
      { question: "Diffraction is:", options: ["Superposition of waves", "Bending around obstacles", "Decomposition into spectrum", "Reflection"] },
      { question: "Condition for interference maximum:", options: ["Δ = kλ", "Δ = (k+1/2)λ", "Δ = 0", "Δ = ∞"] },
      { question: "Diffraction grating period d = 10 μm. 1st order maximum for λ = 500 nm:", options: ["sinφ = 0.05", "sinφ = 0.5", "sinφ = 5", "sinφ = 0.005"] },
      { question: "Polarization proves that light is a wave that is:", options: ["Longitudinal", "Transverse", "Standing", "Shock"] },
      { question: "Malus's law: I = ?", options: ["I₀cos²φ", "I₀sinφ", "I₀/cosφ", "I₀cosφ"] },
      { question: "Holography uses:", options: ["Only interference", "Interference and diffraction", "Only refraction", "Only reflection"] },
    ]
  },
  // Advanced (2)
  "opt-advanced-1": {
    title: "Quantum Optics",
    questions: [
      { question: "Photon energy E = ?", options: ["hν", "hλ", "h/ν", "h/λ"] },
      { question: "Photon momentum p = ?", options: ["h/λ", "hλ", "hν", "h/ν"] },
      { question: "The photoelectric effect is explained by:", options: ["Wave theory", "Corpuscular theory", "Both", "Neither"] },
      { question: "Red boundary of photoelectric effect:", options: ["ν_min = A/h", "ν_max = A/h", "ν = 0", "ν = ∞"] },
      { question: "Einstein's equation for photoelectric effect:", options: ["hν = A + mv²/2", "hν = A - mv²/2", "hν = A", "hν = mv²/2"] },
      { question: "Compton scattering proves:", options: ["Wave nature of light", "Corpuscular nature of light", "Nothing", "Dispersion"] },
      { question: "Light pressure on a surface:", options: ["p = (1+R)I/c", "p = I/c", "p = Ic", "p = 0"] },
      { question: "Laser radiation:", options: ["Incoherent", "Coherent and monochromatic", "White", "Scattered"] },
    ]
  },
  "opt-advanced-2": {
    title: "Spectroscopy and Radiation",
    questions: [
      { question: "Emission spectrum of an atom:", options: ["Continuous", "Line", "Band", "White"] },
      { question: "Balmer formula describes:", options: ["Hydrogen spectrum", "Helium spectrum", "X-rays", "Radio waves"] },
      { question: "Kirchhoff's law relates:", options: ["Absorption and emission", "Refraction and reflection", "Diffraction and interference", "Mass and energy"] },
      { question: "A blackbody:", options: ["Fully absorbs light", "Fully reflects", "Is transparent", "Is white"] },
      { question: "Stefan-Boltzmann law: R ~ ?", options: ["T", "T²", "T⁴", "1/T"] },
      { question: "Wien's displacement law: λ_max ~ ?", options: ["T", "1/T", "T²", "1/T²"] },
      { question: "Luminescence is:", options: ["Thermal radiation", "Cold glow", "Reflection", "Refraction"] },
      { question: "Fluorescence stops:", options: ["Immediately after excitation", "After a long time", "Never", "Upon heating"] },
    ]
  },
  // Olympiad (3)
  "opt-olympiad-1": {
    title: "Olympiad Optics I",
    questions: [
      { question: "Fermat's principle:", options: ["Light follows the shortest path", "Light follows the path of least time", "Light follows a straight line", "Light does not propagate"] },
      { question: "Huygens-Fresnel principle explains:", options: ["Only reflection", "Only refraction", "Diffraction and interference", "Only interference"] },
      { question: "Fresnel zones are used for:", options: ["Calculating diffraction", "Measuring wavelength", "Creating lenses", "Polarization"] },
      { question: "Resolving power of a telescope:", options: ["~ D/λ", "~ λ/D", "~ Dλ", "~ D²/λ"] },
      { question: "Rayleigh criterion:", options: ["Minimum of one pattern at maximum of another", "Maxima coincide", "Minima coincide", "No interference"] },
      { question: "Dispersion is the dependence of n on:", options: ["λ", "Angle", "Intensity", "Temperature"] },
      { question: "Anomalous dispersion is observed:", options: ["Everywhere", "Near absorption lines", "In vacuum", "Nowhere"] },
      { question: "Group velocity of light:", options: ["Always = c", "Can be > c", "Always < c", "= 0"] },
      { question: "Phase velocity of light:", options: ["Always ≤ c", "Can be > c", "= c", "= 0"] },
      { question: "Optical path length:", options: ["L = nl", "L = l/n", "L = l", "L = n"] },
    ]
  },
  "opt-olympiad-2": {
    title: "Olympiad Optics II",
    questions: [
      { question: "Rayleigh scattering formula: I ~ ?", options: ["1/λ⁴", "λ⁴", "1/λ²", "λ²"] },
      { question: "The sky is blue because of:", options: ["Absorption", "Scattering", "Diffraction", "Interference"] },
      { question: "Doppler effect for light:", options: ["Δλ/λ = v/c", "Δλ = v", "λ = c/v", "Does not exist"] },
      { question: "Redshift of galaxies means:", options: ["Approach", "Recession", "Rest", "Rotation"] },
      { question: "Polarization upon reflection (Brewster's angle):", options: ["tanφ = n", "sinφ = n", "cosφ = n", "φ = n"] },
      { question: "Birefringence is a property of:", options: ["Isotropic crystals", "Anisotropic crystals", "All substances", "Liquids"] },
      { question: "Kerr effect is:", options: ["Birefringence in an electric field", "Polarization", "Diffraction", "Interference"] },
      { question: "Faraday effect is:", options: ["Rotation of polarization plane in a magnetic field", "Light absorption", "Refraction", "Reflection"] },
      { question: "Optical activity is a property of:", options: ["All substances", "Chiral molecules", "Only crystals", "Only gases"] },
      { question: "A quarter-wave plate converts:", options: ["Linear polarization to circular", "Circular to linear", "Both options", "Changes nothing"] },
    ]
  },
  "opt-olympiad-3": {
    title: "Olympiad Optics III",
    questions: [
      { question: "Nonlinear optics studies:", options: ["Interference", "Processes at high intensity", "Geometric optics", "Reflection"] },
      { question: "Second harmonic generation is:", options: ["Frequency doubling", "Frequency division", "Frequency preservation", "Absorption"] },
      { question: "Optical parametric oscillator:", options: ["Creates coherent light", "Splits a photon into two", "Absorbs light", "Reflects light"] },
      { question: "Self-focusing of light occurs due to:", options: ["Dependence of n on intensity", "Diffraction", "Polarization", "Dispersion"] },
      { question: "Solitons are:", options: ["Nonlinear waves preserving their shape", "Ordinary waves", "Standing waves", "Damped waves"] },
      { question: "Photonic crystals have:", options: ["Band gap for photons", "Only one frequency", "Infinite conductivity", "Zero refractive index"] },
      { question: "Metamaterials can have:", options: ["n < 0", "n = 0", "Both options are possible", "Only n > 0"] },
      { question: "A superlens uses:", options: ["Negative refraction", "Ordinary refraction", "Reflection", "Diffraction"] },
      { question: "Plasmons are:", options: ["Collective electron oscillations", "Photons", "Phonons", "Magnons"] },
      { question: "Ultrafast optics studies processes:", options: ["Slower than 1 s", "Attosecond and femtosecond", "Only continuous", "Microsecond"] },
    ]
  },

  // ==================== ATOMIC PHYSICS ====================
  // Basic (3)
  "atom-basic-1": {
    title: "Atomic Structure",
    questions: [
      { question: "An atom consists of:", options: ["Only protons", "A nucleus and electrons", "Only neutrons", "Photons"] },
      { question: "Charge of an electron:", options: ["Positive", "Negative", "Neutral", "Variable"] },
      { question: "Charge of a proton:", options: ["Positive", "Negative", "Neutral", "Variable"] },
      { question: "A neutron has charge:", options: ["+1", "-1", "0", "+2"] },
      { question: "An atom is electrically:", options: ["Positive", "Negative", "Neutral", "Differently charged"] },
    ]
  },
  "atom-basic-2": {
    title: "Radioactivity",
    questions: [
      { question: "Radioactivity is:", options: ["Heating", "Spontaneous nuclear decay", "Chemical reaction", "Electric current"] },
      { question: "An alpha particle is:", options: ["An electron", "A helium nucleus", "A photon", "A neutron"] },
      { question: "A beta particle is:", options: ["An electron or positron", "A proton", "A neutron", "An alpha particle"] },
      { question: "Gamma radiation is:", options: ["A stream of particles", "Electromagnetic radiation", "Sound", "Heat"] },
      { question: "Half-life is the time during which:", options: ["All nuclei decay", "Half of nuclei decay", "One nucleus decays", "Nothing decays"] },
    ]
  },
  "atom-basic-3": {
    title: "Nuclear Reactions",
    questions: [
      { question: "A nuclear reaction is:", options: ["A chemical reaction", "Transformation of nuclei", "Heating", "Cooling"] },
      { question: "Nuclear fission is:", options: ["Decay into fragments", "Fusion of nuclei", "Emission of a photon", "Absorption of an electron"] },
      { question: "Nuclear fusion is:", options: ["Decay", "Merging of light nuclei", "Neutron absorption", "Alpha particle emission"] },
      { question: "The Sun's energy is released through:", options: ["Uranium fission", "Hydrogen fusion", "Chemical reactions", "Gravity"] },
      { question: "Nuclear power plants operate on:", options: ["Fusion", "Fission", "Burning coal", "Solar energy"] },
    ]
  },
  // Standard (2)
  "atom-standard-1": {
    title: "Quantum Physics",
    questions: [
      { question: "Planck's constant h ≈", options: ["6.6×10⁻³⁴ J·s", "6.6×10⁻²³ J·s", "1.6×10⁻¹⁹ C", "3×10⁸ m/s"] },
      { question: "Photon energy E = ?", options: ["hν", "hλ", "h/ν", "mc²"] },
      { question: "De Broglie wavelength: λ = ?", options: ["h/p", "hp", "p/h", "h+p"] },
      { question: "Heisenberg's uncertainty principle:", options: ["ΔxΔp ≥ ℏ/2", "ΔxΔp = 0", "ΔxΔp ≤ ℏ", "Δx = Δp"] },
      { question: "Energy levels in an atom:", options: ["Continuous", "Discrete", "Absent", "Infinite"] },
      { question: "Spectrum of the hydrogen atom:", options: ["Continuous", "Line", "Band", "White"] },
      { question: "Formula for hydrogen energy levels:", options: ["E_n = -13.6/n² eV", "E_n = 13.6n² eV", "E_n = n·13.6 eV", "E_n = -13.6n eV"] },
    ]
  },
  "atom-standard-2": {
    title: "Nuclear Physics",
    questions: [
      { question: "Mass number A = ?", options: ["Z + N", "Z - N", "Z × N", "Z / N"] },
      { question: "Isotopes are nuclei with the same:", options: ["A", "Z", "N", "Mass"] },
      { question: "Radioactive decay law:", options: ["N = N₀e^(-λt)", "N = N₀t", "N = N₀/t", "N = λt"] },
      { question: "Half-life T = ?", options: ["ln2/λ", "λ/ln2", "λln2", "1/λ"] },
      { question: "Mass defect is related to:", options: ["Binding energy", "Charge", "Spin", "Magnetic moment"] },
      { question: "Binding energy E = ?", options: ["Δm·c²", "Δm·c", "Δm/c²", "Δm + c²"] },
      { question: "Specific binding energy is maximum for:", options: ["Hydrogen", "Uranium", "Iron", "Helium"] },
    ]
  },
  // Advanced (2)
  "atom-advanced-1": {
    title: "Quantum Mechanics",
    questions: [
      { question: "Schrödinger equation:", options: ["iℏ∂ψ/∂t = Ĥψ", "F = ma", "E = mc²", "pV = νRT"] },
      { question: "Wave function ψ describes:", options: ["Trajectory", "Probability of location", "Energy", "Momentum"] },
      { question: "|ψ|² is:", options: ["Energy", "Probability density", "Momentum", "Coordinate"] },
      { question: "Pauli exclusion principle:", options: ["Two fermions cannot be in the same state", "Energy is conserved", "Momentum is conserved", "Charge is conserved"] },
      { question: "An electron is:", options: ["A boson", "A fermion", "A photon", "A meson"] },
      { question: "Electron spin:", options: ["0", "1/2", "1", "3/2"] },
      { question: "Tunnel effect is:", options: ["Passing through a barrier", "Reflection from a barrier", "Absorption", "Radiation"] },
      { question: "Quantum numbers of an electron in an atom:", options: ["n, l, m, s", "Only n", "Only l", "n and l"] },
    ]
  },
  "atom-advanced-2": {
    title: "Elementary Particles",
    questions: [
      { question: "Quarks are:", options: ["Components of hadrons", "Leptons", "Bosons", "Mesons"] },
      { question: "A proton consists of quarks:", options: ["uud", "udd", "uuu", "ddd"] },
      { question: "A neutron consists of quarks:", options: ["uud", "udd", "uuu", "ddd"] },
      { question: "Carrier of electromagnetic interaction:", options: ["Gluon", "Photon", "W-boson", "Z-boson"] },
      { question: "Carrier of strong interaction:", options: ["Gluon", "Photon", "W-boson", "Graviton"] },
      { question: "Antimatter differs from matter by:", options: ["Sign of charge", "Mass", "Spin", "Nothing"] },
      { question: "Neutrino is:", options: ["A hadron", "A lepton", "A quark", "A boson"] },
      { question: "The Higgs boson is responsible for:", options: ["Mass of particles", "Charge", "Spin", "Color"] },
    ]
  },
  // Olympiad (3)
  "atom-olympiad-1": {
    title: "Olympiad Atomic Physics I",
    questions: [
      { question: "Fine structure of the spectrum is related to:", options: ["Spin-orbit coupling", "Gravity", "Strong interaction", "Weak interaction"] },
      { question: "Hyperfine structure is related to:", options: ["Electron-nucleus interaction", "Gravity", "Electric field", "Earth's magnetic field"] },
      { question: "Zeeman effect is:", options: ["Line splitting in a magnetic field", "Splitting in an electric field", "Light absorption", "Light emission"] },
      { question: "Stark effect is:", options: ["Splitting in a magnetic field", "Splitting in an electric field", "Light absorption", "Reflection"] },
      { question: "Lamb shift is explained by:", options: ["Quantum electrodynamics", "Classical mechanics", "Thermodynamics", "Optics"] },
      { question: "Electron g-factor ≈", options: ["2", "1", "0", "0.5"] },
      { question: "Bohr magneton μ_B = ?", options: ["eℏ/2m_e", "eℏ/m_e", "e/2m_e", "ℏ/2m_e"] },
      { question: "Selection rules for dipole transitions:", options: ["Δl = ±1", "Δl = 0", "Δl = ±2", "Δl any"] },
      { question: "Metastable states last:", options: ["Long due to forbidden transitions", "Instantly", "Infinitely", "Negative time"] },
      { question: "Laser is based on:", options: ["Stimulated emission", "Spontaneous emission", "Absorption", "Scattering"] },
    ]
  },
  "atom-olympiad-2": {
    title: "Olympiad Atomic Physics II",
    questions: [
      { question: "Dirac equation describes:", options: ["Relativistic electron", "Photon", "Neutron", "Atom"] },
      { question: "From Dirac's equation follows:", options: ["Existence of antimatter", "Ohm's law", "Maxwell's equation", "Newton's law"] },
      { question: "QED is a theory of:", options: ["Electromagnetic interaction", "Strong interaction", "Weak interaction", "Gravity"] },
      { question: "Feynman diagrams are used for:", options: ["Calculating scattering amplitudes", "Building orbits", "Measuring mass", "Determining charge"] },
      { question: "Anomalous magnetic moment of electron:", options: ["(g-2)/2 ≈ 0.00116", "= 0", "= 1", "= 2"] },
      { question: "Renormalization in QED is needed to:", options: ["Remove divergences", "Increase accuracy", "Simplify", "For beauty"] },
      { question: "Fine structure constant α ≈", options: ["1/137", "137", "1", "1/2"] },
      { question: "Vacuum fluctuations are:", options: ["Virtual particles", "Real particles", "Electric field", "Magnetic field"] },
      { question: "Casimir effect is related to:", options: ["Vacuum energy", "Gravity", "Strong interaction", "Weak interaction"] },
      { question: "Lamb shift ≈", options: ["1000 MHz", "1 MHz", "1 GHz", "1 kHz"] },
    ]
  },
  "atom-olympiad-3": {
    title: "Olympiad Nuclear Physics",
    questions: [
      { question: "Liquid drop model of the nucleus:", options: ["Treats the nucleus as a liquid drop", "Describes electrons", "Quantum model", "Relativistic model"] },
      { question: "Nuclear shell model explains:", options: ["Magic numbers", "Proton mass", "Electron charge", "Photon spin"] },
      { question: "Magic numbers:", options: ["2, 8, 20, 28, 50, 82, 126", "1, 2, 3, 4, 5", "Prime numbers", "Fibonacci numbers"] },
      { question: "Nuclear reaction cross-section σ is measured in:", options: ["Barns", "Coulombs", "Teslas", "Joules"] },
      { question: "Critical mass is:", options: ["Minimum mass for a chain reaction", "Proton mass", "Electron mass", "Mass defect"] },
      { question: "Neutron moderator in a reactor:", options: ["Accelerates neutrons", "Slows down neutrons", "Absorbs neutrons", "Generates neutrons"] },
      { question: "Helium synthesis from hydrogen releases energy:", options: ["≈26 MeV per reaction", "≈200 MeV", "≈1 MeV", "0 MeV"] },
      { question: "Thermonuclear plasma is confined by:", options: ["Magnetic field", "Gravity", "Electric field", "Walls"] },
      { question: "Lawson criterion determines:", options: ["Conditions for igniting a thermonuclear reaction", "Plasma mass", "Melting temperature", "Gas pressure"] },
      { question: "A neutron star is:", options: ["A star made of neutrons", "An ordinary star", "A white dwarf", "A red giant"] },
    ]
  },

  // ==================== ASTRONOMY ====================
  "astronomy-basic-1": {
    title: "Basics of Astronomy",
    questions: [
      { question: "What is the system containing the Sun, planets, and small bodies called?", options: ["Andromeda Galaxy", "Solar System", "Local Group", "Orion Nebula"] },
      { question: "Why does the Moon shine in the night sky?", options: ["It emits light itself", "It reflects sunlight", "It is heated by Earth", "It consists of glowing gas"] },
      { question: "Which planet is a gas giant?", options: ["Mars", "Earth", "Jupiter", "Mercury"] },
      { question: "What is Earth's path around the Sun called?", options: ["Equator", "Orbit", "Meridian", "Spiral"] },
      { question: "What does a telescope primarily study?", options: ["Atomic nuclei", "Celestial bodies and their radiation", "Only Earth's magnetic field", "Only chemical reactions"] },
    ]
  },
  "astronomy-standard-1": {
    title: "Celestial Mechanics and Observation",
    questions: [
      { question: "Which law connects orbital period and semi-major axis of a planet?", options: ["Ohm's law", "Kepler's third law", "Pascal's law", "Archimedes' law"] },
      { question: "A geostationary satellite must be:", options: ["Above a pole", "On an equatorial orbit with a 24-hour period", "On any low orbit", "On the Moon's orbit"] },
      { question: "What does redshift in a galaxy spectrum mean?", options: ["The galaxy is receding", "The galaxy is cooling quickly", "The galaxy rotates around Earth", "The galaxy is losing mass"] },
      { question: "Why do space telescopes produce sharper images than many ground telescopes?", options: ["They are always larger", "They avoid atmospheric turbulence", "They work only at night", "They are closer to the stars"] },
      { question: "Which quantity is commonly measured in light-years?", options: ["Mass of a star", "Distance to a star", "Surface temperature", "Rotation period of a planet"] },
    ]
  },
  "astronomy-advanced-1": {
    title: "Stars, Galaxies, and Cosmology",
    questions: [
      { question: "What does the Hertzsprung-Russell diagram show?", options: ["Mass versus orbital radius", "Luminosity versus surface temperature", "Only chemical composition", "Motion of galaxies in the Local Group"] },
      { question: "What is the final stage of a Sun-like star?", options: ["Black hole", "White dwarf", "Neutron star", "A new Sun"] },
      { question: "What fact underlies Hubble's law?", options: ["Brighter stars are colder", "The farther the galaxy, the greater its recession speed", "The larger the planet mass, the smaller its radius", "Closer galaxies have larger redshift"] },
      { question: "What best indicates an unseen compact object in a binary system?", options: ["Change in Earth's atmospheric color", "Orbital motion of the visible star around the center of mass", "Permanent absence of spectrum", "Absence of gravity near the system"] },
      { question: "What is spectroscopy used for in astronomy?", options: ["Only measuring planet mass", "Determining composition, temperature, and radial velocity", "Only photographing nebulae", "Only measuring distances in meters"] },
    ]
  },
  "astronomy-advanced-2": {
    title: "Observational Astronomy and Distances",
    questions: [
      { question: "Which method is used most directly to measure distances to nearby stars?", options: ["Annual parallax", "Ohm's law", "Nuclear mass measurement", "Blackbody spectrum"] },
      { question: "What mainly determines a telescope's angular resolution?", options: ["Only body color", "Aperture diameter and wavelength", "Only telescope mass", "Only observing time"] },
      { question: "Why are radio telescopes often combined into interferometers?", options: ["To reduce the speed of light", "To increase the effective baseline and improve resolution", "To make the signal colorful", "To measure only air temperature"] },
      { question: "What can be found from a star's spectral lines?", options: ["Only its distance", "Composition, temperature, and radial velocity", "Only a planet's orbital size", "Only the age of the Universe"] },
      { question: "What is a standard candle in astronomy?", options: ["Any bright star", "An object with known luminosity used to estimate distance", "Any object radiating only in radio", "A telescope with fixed aperture"] },
    ]
  },
  "astronomy-olympiad-1": {
    title: "Olympiad Astronomy",
    questions: [
      { question: "According to Kepler's third law for bodies orbiting the same center, the ratio T²/a³ is:", options: ["The same for all orbits", "Larger for heavier satellites", "Smaller at larger distance", "Always zero"] },
      { question: "Why are total solar eclipses rare at one location on Earth?", options: ["Because the Sun is too far away", "Because the Moon's shadow forms a narrow path on Earth", "Because the Moon shines too weakly", "Because the atmosphere always blocks them"] },
      { question: "If a star has large proper motion across the sky, that usually means it is:", options: ["Relatively close", "Necessarily very massive", "A black hole", "At the galactic center"] },
      { question: "What best explains flat galaxy rotation curves?", options: ["Only visible matter in the disk", "The presence of additional unseen mass", "Absence of gravity at the outskirts", "Only radiation pressure"] },
      { question: "Which expression belongs to Hubble's law?", options: ["v = H₀d", "F = ma", "pV = const", "E = mc²"] },
    ]
  },

  // ==================== RELATIVITY ====================
  "relativity-basic-1": {
    title: "Basics of Special Relativity",
    questions: [
      { question: "Who formulated special relativity?", options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Niels Bohr"] },
      { question: "Which quantity is the same for all inertial observers in vacuum?", options: ["Speed of light", "Mass of any body", "Length of any rod", "Period of a pendulum"] },
      { question: "What happens to time for rapidly moving clocks from the viewpoint of an outside observer?", options: ["It goes faster", "It goes slower", "It does not change", "It disappears"] },
      { question: "What happens to the length of a body along the direction of motion?", options: ["It increases", "It does not change", "It contracts", "It becomes zero at any speed"] },
      { question: "What is the formula E = mc² called?", options: ["Law of gravitation", "Mass-energy relation", "Kepler's law", "Equation of state of a gas"] },
    ]
  },
  "relativity-standard-1": {
    title: "Relativistic Effects",
    questions: [
      { question: "As a body's speed approaches c, the Lorentz factor γ:", options: ["Tends to zero", "Remains equal to 1", "Increases", "Becomes negative"] },
      { question: "Which formula describes time dilation?", options: ["Δt = Δt₀ / γ", "Δt = γΔt₀", "Δt = mv", "Δt = c / v"] },
      { question: "Relativistic momentum equals:", options: ["p = mv²", "p = γmv", "p = mc²", "p = F / t"] },
      { question: "Why can't a particle with nonzero rest mass reach light speed?", options: ["Its charge disappears", "It would require infinite energy", "Its mass decreases", "Time stops acting"] },
      { question: "What is true about proper length?", options: ["It is measured in the body's rest frame", "It is always less than observed length", "It depends only on mass", "It becomes zero for any motion"] },
    ]
  },
  "relativity-advanced-1": {
    title: "Energy, Momentum, and Invariants",
    questions: [
      { question: "How is the total energy of a particle written in special relativity?", options: ["E = γmc²", "E = mv² / 2", "E = p / c", "E = Fq"] },
      { question: "What is the interval for a light signal?", options: ["s > 0", "s < 0", "s = 0", "s = c"] },
      { question: "How are energy, momentum, and rest mass related?", options: ["E = pc + mc²", "E² = p²c² + m²c⁴", "E = p² / 2m", "E² = p² + m²"] },
      { question: "If γ = 2, then the kinetic energy equals:", options: ["0", "mc² / 2", "(γ - 1)mc² = mc²", "2mc²"] },
      { question: "What does interval invariance mean physically?", options: ["All observers measure the same length", "There is a spacetime quantity identical in all inertial frames", "All bodies have the same speed", "Mass disappears in motion"] },
    ]
  },
  "relativity-advanced-2": {
    title: "Lorentz Transformations and Observers",
    questions: [
      { question: "What replaces Galilean transformations at speeds comparable to light speed?", options: ["Newton transformations", "Lorentz transformations", "Fourier transforms", "Maxwell transforms"] },
      { question: "Why can't we simply add speeds by the classical formula u + v in special relativity?", options: ["Because that could exceed c", "Because mass disappears", "Because momentum stops existing", "Because time does not exist"] },
      { question: "In which frame is proper time measured?", options: ["In the frame where the process occurs at one point", "Only in the laboratory frame", "Only on a moving spaceship", "It is identical in any frame"] },
      { question: "What does relativity of simultaneity mean?", options: ["All clocks always run identically", "Events simultaneous in one inertial frame may not be simultaneous in another", "Time depends only on temperature", "Simultaneity cannot be defined at all"] },
      { question: "What happens to γ as v → c?", options: ["γ → 0", "γ → 1", "γ → ∞", "γ becomes negative"] },
    ]
  },
  "relativity-olympiad-1": {
    title: "Olympiad Relativity",
    questions: [
      { question: "At what speed is the Lorentz factor equal to 2?", options: ["0.5c", "0.707c", "0.866c", "0.95c"] },
      { question: "If γ = 10 and the proper lifetime of a particle is 2 μs, what is it in the laboratory frame?", options: ["0.2 μs", "2 μs", "20 μs", "200 μs"] },
      { question: "Which is the invariant energy-momentum relation?", options: ["E² - p²c² = m²c⁴", "E = pc", "E = p²/2m", "E² + p²c² = 0"] },
      { question: "What is true for a particle with zero rest mass?", options: ["It always moves slower than c", "It can be at rest", "It moves at speed c", "Its energy is always zero"] },
      { question: "Which effect is confirmed by the observation of cosmic muons near Earth's surface?", options: ["Length contraction without time dilation", "Time dilation for fast particles", "Violation of energy conservation", "Change of muon charge in the atmosphere"] },
    ]
  },
};
