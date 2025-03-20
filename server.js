const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON request bodies
app.use(express.json());

// Session middleware
app.use(session({
  secret: 'physik-bildung-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Data: Physics Formulas
const formulas = [
  // Grundlagen Mechanik
  {
    id: 'geschwindigkeit',
    name: 'Gleichförmige Bewegung',
    latex: 'v = \\frac{s}{t}',
    category: 'mechanics',
    level: 'basic',
    variables: [
      { symbol: 'v', name: 'Geschwindigkeit', unit: 'm/s' },
      { symbol: 's', name: 'Strecke', unit: 'm' },
      { symbol: 't', name: 'Zeit', unit: 's' }
    ],
    explanation: 'Die Geschwindigkeit bei gleichförmiger Bewegung ergibt sich aus dem Verhältnis von zurückgelegter Strecke zur dafür benötigten Zeit.',
    examples: [
      {
        problem: 'Ein Auto fährt 120 km in 1,5 Stunden. Berechne die durchschnittliche Geschwindigkeit.',
        solution: 'v = s/t = 120 km / 1,5 h = 80 km/h = 22,2 m/s'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'v' && variables.s && variables.t) {
        return {
          value: parseFloat(variables.s) / parseFloat(variables.t),
          unit: 'm/s'
        };
      } else if (solveFor === 's' && variables.v && variables.t) {
        return {
          value: parseFloat(variables.v) * parseFloat(variables.t),
          unit: 'm'
        };
      } else if (solveFor === 't' && variables.s && variables.v) {
        return {
          value: parseFloat(variables.s) / parseFloat(variables.v),
          unit: 's'
        };
      }
      return null;
    }
  },
  {
    id: 'beschleunigte-bewegung',
    name: 'Gleichmäßig beschleunigte Bewegung',
    latex: 's = \\frac{1}{2} \\cdot a \\cdot t^2 + v_0 \\cdot t',
    category: 'mechanics',
    level: 'basic',
    variables: [
      { symbol: 's', name: 'Strecke', unit: 'm' },
      { symbol: 'a', name: 'Beschleunigung', unit: 'm/s²' },
      { symbol: 't', name: 'Zeit', unit: 's' },
      { symbol: 'v_0', name: 'Anfangsgeschwindigkeit', unit: 'm/s' }
    ],
    explanation: 'Die Strecke bei gleichmäßig beschleunigter Bewegung ergibt sich aus der Beschleunigung, der Zeit und der Anfangsgeschwindigkeit.',
    examples: [
      {
        problem: 'Ein Auto beschleunigt gleichmäßig aus dem Stand mit 2 m/s². Welche Strecke legt es in 10 Sekunden zurück?',
        solution: 's = (1/2)·a·t² + v₀·t = 0,5 · 2 m/s² · (10 s)² + 0 m/s · 10 s = 100 m'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 's' && variables.a && variables.t && variables.v_0) {
        return {
          value: 0.5 * parseFloat(variables.a) * Math.pow(parseFloat(variables.t), 2) + parseFloat(variables.v_0) * parseFloat(variables.t),
          unit: 'm'
        };
      }
      // Vereinfachte Berechnung für v₀ = 0
      else if (solveFor === 'a' && variables.s && variables.t && !variables.v_0) {
        return {
          value: 2 * parseFloat(variables.s) / Math.pow(parseFloat(variables.t), 2),
          unit: 'm/s²'
        };
      }
      else if (solveFor === 't' && variables.s && variables.a && !variables.v_0) {
        return {
          value: Math.sqrt(2 * parseFloat(variables.s) / parseFloat(variables.a)),
          unit: 's'
        };
      }
      return null;
    }
  },
  {
    id: 'fallbeschleunigung',
    name: 'Freier Fall',
    latex: 'h = \\frac{1}{2} \\cdot g \\cdot t^2',
    category: 'mechanics',
    level: 'basic',
    variables: [
      { symbol: 'h', name: 'Fallhöhe', unit: 'm' },
      { symbol: 'g', name: 'Erdbeschleunigung', unit: 'm/s²', defaultValue: '9.81' },
      { symbol: 't', name: 'Fallzeit', unit: 's' }
    ],
    explanation: 'Der freie Fall ist ein Spezialfall der gleichmäßig beschleunigten Bewegung, bei der die Beschleunigung der Erdbeschleunigung g entspricht.',
    examples: [
      {
        problem: 'Wie tief fällt ein Stein in 3 Sekunden? (g = 9,81 m/s²)',
        solution: 'h = (1/2)·g·t² = 0,5 · 9,81 m/s² · (3 s)² = 44,1 m'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'h' && variables.g && variables.t) {
        return {
          value: 0.5 * parseFloat(variables.g) * Math.pow(parseFloat(variables.t), 2),
          unit: 'm'
        };
      } else if (solveFor === 'g' && variables.h && variables.t) {
        return {
          value: 2 * parseFloat(variables.h) / Math.pow(parseFloat(variables.t), 2),
          unit: 'm/s²'
        };
      } else if (solveFor === 't' && variables.h && variables.g) {
        return {
          value: Math.sqrt(2 * parseFloat(variables.h) / parseFloat(variables.g)),
          unit: 's'
        };
      }
      return null;
    }
  },
  // Grundlagen Elektrizität
  {
    id: 'elektrische-leistung',
    name: 'Elektrische Leistung',
    latex: 'P = U \\cdot I',
    category: 'electricity',
    level: 'basic',
    variables: [
      { symbol: 'P', name: 'Elektrische Leistung', unit: 'W' },
      { symbol: 'U', name: 'Elektrische Spannung', unit: 'V' },
      { symbol: 'I', name: 'Elektrische Stromstärke', unit: 'A' }
    ],
    explanation: 'Die elektrische Leistung gibt an, wie viel elektrische Energie pro Zeiteinheit umgesetzt wird. Sie ist das Produkt aus Spannung und Stromstärke.',
    examples: [
      {
        problem: 'Eine Glühbirne wird an 230 V angeschlossen und zieht einen Strom von 0,26 A. Welche Leistung hat sie?',
        solution: 'P = U·I = 230 V · 0,26 A = 59,8 W'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'P' && variables.U && variables.I) {
        return {
          value: parseFloat(variables.U) * parseFloat(variables.I),
          unit: 'W'
        };
      } else if (solveFor === 'U' && variables.P && variables.I) {
        return {
          value: parseFloat(variables.P) / parseFloat(variables.I),
          unit: 'V'
        };
      } else if (solveFor === 'I' && variables.P && variables.U) {
        return {
          value: parseFloat(variables.P) / parseFloat(variables.U),
          unit: 'A'
        };
      }
      return null;
    }
  },
  {
    id: 'elektrische-arbeit',
    name: 'Elektrische Arbeit',
    latex: 'W = P \\cdot t',
    category: 'electricity',
    level: 'basic',
    variables: [
      { symbol: 'W', name: 'Elektrische Arbeit', unit: 'J' },
      { symbol: 'P', name: 'Elektrische Leistung', unit: 'W' },
      { symbol: 't', name: 'Zeit', unit: 's' }
    ],
    explanation: 'Die elektrische Arbeit ist die Energie, die in einem bestimmten Zeitraum durch ein elektrisches Gerät umgesetzt wird. Sie ist das Produkt aus Leistung und Zeit.',
    examples: [
      {
        problem: 'Ein Fön mit einer Leistung von 1800 W wird 5 Minuten lang betrieben. Wie viel elektrische Arbeit wird verrichtet?',
        solution: 'W = P·t = 1800 W · 300 s = 540.000 J = 540 kJ = 0,15 kWh'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'W' && variables.P && variables.t) {
        return {
          value: parseFloat(variables.P) * parseFloat(variables.t),
          unit: 'J'
        };
      } else if (solveFor === 'P' && variables.W && variables.t) {
        return {
          value: parseFloat(variables.W) / parseFloat(variables.t),
          unit: 'W'
        };
      } else if (solveFor === 't' && variables.W && variables.P) {
        return {
          value: parseFloat(variables.W) / parseFloat(variables.P),
          unit: 's'
        };
      }
      return null;
    }
  },
  {
    id: 'elektrischer-widerstand-seriell',
    name: 'Widerstände in Reihenschaltung',
    latex: 'R_{ges} = R_1 + R_2 + ... + R_n',
    category: 'electricity',
    level: 'basic',
    variables: [
      { symbol: 'R_ges', name: 'Gesamtwiderstand', unit: 'Ω' },
      { symbol: 'R_1', name: 'Widerstand 1', unit: 'Ω' },
      { symbol: 'R_2', name: 'Widerstand 2', unit: 'Ω' }
    ],
    explanation: 'Bei einer Reihenschaltung von Widerständen addieren sich die einzelnen Widerstände zum Gesamtwiderstand.',
    examples: [
      {
        problem: 'In einer Reihenschaltung befinden sich drei Widerstände mit R₁ = 100 Ω, R₂ = 220 Ω und R₃ = 330 Ω. Wie groß ist der Gesamtwiderstand?',
        solution: 'R_ges = R₁ + R₂ + R₃ = 100 Ω + 220 Ω + 330 Ω = 650 Ω'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'R_ges' && variables.R_1 && variables.R_2) {
        return {
          value: parseFloat(variables.R_1) + parseFloat(variables.R_2),
          unit: 'Ω'
        };
      }
      return null;
    }
  },
  {
    id: 'elektrischer-widerstand-parallel',
    name: 'Widerstände in Parallelschaltung',
    latex: '\\frac{1}{R_{ges}} = \\frac{1}{R_1} + \\frac{1}{R_2} + ... + \\frac{1}{R_n}',
    category: 'electricity',
    level: 'basic',
    variables: [
      { symbol: 'R_ges', name: 'Gesamtwiderstand', unit: 'Ω' },
      { symbol: 'R_1', name: 'Widerstand 1', unit: 'Ω' },
      { symbol: 'R_2', name: 'Widerstand 2', unit: 'Ω' }
    ],
    explanation: 'Bei einer Parallelschaltung von Widerständen addieren sich die Kehrwerte der einzelnen Widerstände zum Kehrwert des Gesamtwiderstands.',
    examples: [
      {
        problem: 'In einer Parallelschaltung befinden sich zwei Widerstände mit R₁ = 100 Ω und R₂ = 50 Ω. Wie groß ist der Gesamtwiderstand?',
        solution: '1/R_ges = 1/R₁ + 1/R₂ = 1/100 Ω + 1/50 Ω = 0,01 Ω⁻¹ + 0,02 Ω⁻¹ = 0,03 Ω⁻¹; R_ges = 1/0,03 Ω⁻¹ = 33,3 Ω'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'R_ges' && variables.R_1 && variables.R_2) {
        return {
          value: 1 / ((1 / parseFloat(variables.R_1)) + (1 / parseFloat(variables.R_2))),
          unit: 'Ω'
        };
      }
      return null;
    }
  },
  // Fortgeschrittene Formeln
  {
    id: 'coulombsches-gesetz',
    name: 'Coulombsches Gesetz',
    latex: 'F = k \\cdot \\frac{|q_1 \\cdot q_2|}{r^2}',
    category: 'electricity',
    level: 'advanced',
    variables: [
      { symbol: 'F', name: 'Coulomb-Kraft', unit: 'N' },
      { symbol: 'k', name: 'Coulomb-Konstante', unit: 'N·m²/C²', defaultValue: '8.99e9' },
      { symbol: 'q_1', name: 'Ladung 1', unit: 'C' },
      { symbol: 'q_2', name: 'Ladung 2', unit: 'C' },
      { symbol: 'r', name: 'Abstand', unit: 'm' }
    ],
    explanation: 'Das Coulombsche Gesetz beschreibt die elektrostatische Kraft zwischen zwei Punktladungen. Die Kraft ist proportional zum Produkt der Ladungen und umgekehrt proportional zum Quadrat ihres Abstands.',
    examples: [
      {
        problem: 'Zwei Ladungen von q₁ = 2 μC und q₂ = -3 μC befinden sich im Abstand von 10 cm. Wie groß ist die Coulomb-Kraft zwischen ihnen?',
        solution: 'F = k·|q₁·q₂|/r² = 8,99·10⁹ N·m²/C² · |2·10⁻⁶ C · (-3·10⁻⁶) C| / (0,1 m)² = 5,39 N'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'F' && variables.k && variables.q_1 && variables.q_2 && variables.r) {
        return {
          value: parseFloat(variables.k) * Math.abs(parseFloat(variables.q_1) * parseFloat(variables.q_2)) / Math.pow(parseFloat(variables.r), 2),
          unit: 'N'
        };
      } else if (solveFor === 'r' && variables.F && variables.k && variables.q_1 && variables.q_2) {
        return {
          value: Math.sqrt(parseFloat(variables.k) * Math.abs(parseFloat(variables.q_1) * parseFloat(variables.q_2)) / parseFloat(variables.F)),
          unit: 'm'
        };
      }
      return null;
    }
  },
  {
    id: 'elektrisches-feld',
    name: 'Elektrische Feldstärke',
    latex: 'E = \\frac{F}{q} = k \\cdot \\frac{Q}{r^2}',
    category: 'electricity',
    level: 'advanced',
    variables: [
      { symbol: 'E', name: 'Elektrische Feldstärke', unit: 'V/m' },
      { symbol: 'F', name: 'Kraft', unit: 'N' },
      { symbol: 'q', name: 'Probeladung', unit: 'C' },
      { symbol: 'k', name: 'Coulomb-Konstante', unit: 'N·m²/C²', defaultValue: '8.99e9' },
      { symbol: 'Q', name: 'Quelladung', unit: 'C' },
      { symbol: 'r', name: 'Abstand', unit: 'm' }
    ],
    explanation: 'Die elektrische Feldstärke ist ein Vektorfeld, das die Kraftwirkung auf eine Probeladung beschreibt. Sie ist definiert als die Kraft pro Einheitsladung und ist abhängig von der Quelladung und dem Abstand.',
    examples: [
      {
        problem: 'In welchem Abstand von einer Punktladung Q = 5 nC beträgt die elektrische Feldstärke 450 V/m?',
        solution: 'E = k·Q/r² → r = √(k·Q/E) = √(8,99·10⁹ N·m²/C² · 5·10⁻⁹ C / 450 V/m) ≈ 10 cm'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'E' && variables.F && variables.q) {
        return {
          value: parseFloat(variables.F) / parseFloat(variables.q),
          unit: 'V/m'
        };
      } else if (solveFor === 'E' && variables.k && variables.Q && variables.r) {
        return {
          value: parseFloat(variables.k) * parseFloat(variables.Q) / Math.pow(parseFloat(variables.r), 2),
          unit: 'V/m'
        };
      } else if (solveFor === 'r' && variables.E && variables.k && variables.Q) {
        return {
          value: Math.sqrt(parseFloat(variables.k) * parseFloat(variables.Q) / parseFloat(variables.E)),
          unit: 'm'
        };
      }
      return null;
    }
  },
  {
    id: 'magnetisches-feld-gerader-leiter',
    name: 'Magnetisches Feld eines geraden Leiters',
    latex: 'B = \\frac{\\mu_0 \\cdot I}{2\\pi \\cdot r}',
    category: 'electricity',
    level: 'advanced',
    variables: [
      { symbol: 'B', name: 'Magnetische Flussdichte', unit: 'T' },
      { symbol: 'mu_0', name: 'Magnetische Feldkonstante', unit: 'N/A²', defaultValue: '1.257e-6' },
      { symbol: 'I', name: 'Stromstärke', unit: 'A' },
      { symbol: 'r', name: 'Abstand zum Leiter', unit: 'm' }
    ],
    explanation: 'Das magnetische Feld um einen stromdurchflossenen geraden Leiter ist konzentrisch um den Leiter angeordnet. Die Feldstärke nimmt mit dem Abstand ab.',
    examples: [
      {
        problem: 'Wie groß ist die magnetische Flussdichte in einem Abstand von 5 cm von einem geraden Leiter, durch den ein Strom von 10 A fließt?',
        solution: 'B = (μ₀·I)/(2π·r) = (1,257·10⁻⁶ N/A² · 10 A)/(2π · 0,05 m) ≈ 4·10⁻⁵ T = 40 μT'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'B' && variables.mu_0 && variables.I && variables.r) {
        return {
          value: (parseFloat(variables.mu_0) * parseFloat(variables.I)) / (2 * Math.PI * parseFloat(variables.r)),
          unit: 'T'
        };
      } else if (solveFor === 'r' && variables.B && variables.mu_0 && variables.I) {
        return {
          value: (parseFloat(variables.mu_0) * parseFloat(variables.I)) / (2 * Math.PI * parseFloat(variables.B)),
          unit: 'm'
        };
      } else if (solveFor === 'I' && variables.B && variables.mu_0 && variables.r) {
        return {
          value: (2 * Math.PI * parseFloat(variables.r) * parseFloat(variables.B)) / parseFloat(variables.mu_0),
          unit: 'A'
        };
      }
      return null;
    }
  },
  {
    id: 'magnetisches-feld-spule',
    name: 'Magnetisches Feld einer Spule',
    latex: 'B = \\mu_0 \\cdot \\frac{n \\cdot I}{l}',
    category: 'electricity',
    level: 'advanced',
    variables: [
      { symbol: 'B', name: 'Magnetische Flussdichte im Inneren', unit: 'T' },
      { symbol: 'mu_0', name: 'Magnetische Feldkonstante', unit: 'N/A²', defaultValue: '1.257e-6' },
      { symbol: 'n', name: 'Windungszahl', unit: '' },
      { symbol: 'I', name: 'Stromstärke', unit: 'A' },
      { symbol: 'l', name: 'Länge der Spule', unit: 'm' }
    ],
    explanation: 'Das magnetische Feld im Inneren einer langen Spule (Solenoid) ist nahezu homogen und parallel zur Spulenachse. Die Feldstärke ist proportional zur Windungszahl und zur Stromstärke und umgekehrt proportional zur Länge der Spule.',
    examples: [
      {
        problem: 'Eine Spule mit 200 Windungen und einer Länge von 15 cm wird von einem Strom von 2 A durchflossen. Wie groß ist die magnetische Flussdichte im Inneren der Spule?',
        solution: 'B = μ₀·(n·I)/l = 1,257·10⁻⁶ N/A² · (200 · 2 A) / 0,15 m ≈ 3,35·10⁻³ T = 3,35 mT'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'B' && variables.mu_0 && variables.n && variables.I && variables.l) {
        return {
          value: parseFloat(variables.mu_0) * parseFloat(variables.n) * parseFloat(variables.I) / parseFloat(variables.l),
          unit: 'T'
        };
      } else if (solveFor === 'I' && variables.B && variables.mu_0 && variables.n && variables.l) {
        return {
          value: parseFloat(variables.B) * parseFloat(variables.l) / (parseFloat(variables.mu_0) * parseFloat(variables.n)),
          unit: 'A'
        };
      } else if (solveFor === 'n' && variables.B && variables.mu_0 && variables.I && variables.l) {
        return {
          value: parseFloat(variables.B) * parseFloat(variables.l) / (parseFloat(variables.mu_0) * parseFloat(variables.I)),
          unit: ''
        };
      }
      return null;
    }
  },
  // Optik Formeln
  {
    id: 'reflexionsgesetz',
    name: 'Reflexionsgesetz',
    latex: '\\alpha = \\beta',
    category: 'optics',
    level: 'basic',
    variables: [
      { symbol: 'alpha', name: 'Einfallswinkel', unit: '°' },
      { symbol: 'beta', name: 'Reflexionswinkel', unit: '°' }
    ],
    explanation: 'Das Reflexionsgesetz besagt, dass der Einfallswinkel gleich dem Reflexionswinkel ist. Die Winkel werden zur Normalen (Lot) gemessen.',
    examples: [
      {
        problem: 'Ein Lichtstrahl trifft unter einem Winkel von 30° zur Normalen auf einen Spiegel. Unter welchem Winkel wird er reflektiert?',
        solution: 'Nach dem Reflexionsgesetz gilt: α = β = 30°'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'alpha' && variables.beta) {
        return {
          value: parseFloat(variables.beta),
          unit: '°'
        };
      } else if (solveFor === 'beta' && variables.alpha) {
        return {
          value: parseFloat(variables.alpha),
          unit: '°'
        };
      }
      return null;
    }
  },
  {
    id: 'brechungsgesetz',
    name: 'Brechungsgesetz (Snellius)',
    latex: 'n_1 \\cdot \\sin(\\alpha) = n_2 \\cdot \\sin(\\beta)',
    category: 'optics',
    level: 'basic',
    variables: [
      { symbol: 'n_1', name: 'Brechungsindex Medium 1', unit: '' },
      { symbol: 'alpha', name: 'Einfallswinkel', unit: '°' },
      { symbol: 'n_2', name: 'Brechungsindex Medium 2', unit: '' },
      { symbol: 'beta', name: 'Brechungswinkel', unit: '°' }
    ],
    explanation: 'Das Brechungsgesetz (Snelliussches Gesetz) beschreibt die Richtungsänderung eines Lichtstrahls beim Übergang zwischen zwei Medien mit unterschiedlichen Brechungsindizes. Die Winkel werden zur Normalen (Lot) gemessen.',
    examples: [
      {
        problem: 'Ein Lichtstrahl trifft aus Luft (n₁ ≈ 1) unter einem Winkel von 45° auf eine Wasseroberfläche (n₂ ≈ 1,33). Unter welchem Winkel wird der Strahl ins Wasser gebrochen?',
        solution: 'n₁·sin(α) = n₂·sin(β) → sin(β) = (n₁·sin(α))/n₂ = (1·sin(45°))/1,33 ≈ 0,53; β ≈ 32°'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'beta' && variables.n_1 && variables.alpha && variables.n_2) {
        const alphaRad = parseFloat(variables.alpha) * (Math.PI / 180);
        return {
          value: Math.asin(parseFloat(variables.n_1) * Math.sin(alphaRad) / parseFloat(variables.n_2)) * (180 / Math.PI),
          unit: '°'
        };
      } else if (solveFor === 'alpha' && variables.n_1 && variables.beta && variables.n_2) {
        const betaRad = parseFloat(variables.beta) * (Math.PI / 180);
        return {
          value: Math.asin(parseFloat(variables.n_2) * Math.sin(betaRad) / parseFloat(variables.n_1)) * (180 / Math.PI),
          unit: '°'
        };
      } else if (solveFor === 'n_2' && variables.n_1 && variables.alpha && variables.beta) {
        const alphaRad = parseFloat(variables.alpha) * (Math.PI / 180);
        const betaRad = parseFloat(variables.beta) * (Math.PI / 180);
        return {
          value: parseFloat(variables.n_1) * Math.sin(alphaRad) / Math.sin(betaRad),
          unit: ''
        };
      } else if (solveFor === 'n_1' && variables.beta && variables.alpha && variables.n_2) {
        const alphaRad = parseFloat(variables.alpha) * (Math.PI / 180);
        const betaRad = parseFloat(variables.beta) * (Math.PI / 180);
        return {
          value: parseFloat(variables.n_2) * Math.sin(betaRad) / Math.sin(alphaRad),
          unit: ''
        };
      }
      return null;
    }
  },
  {
    id: 'linsengleichung',
    name: 'Linsengleichung',
    latex: '\\frac{1}{f} = \\frac{1}{g} + \\frac{1}{b}',
    category: 'optics',
    level: 'basic',
    variables: [
      { symbol: 'f', name: 'Brennweite', unit: 'm' },
      { symbol: 'g', name: 'Gegenstandsweite', unit: 'm' },
      { symbol: 'b', name: 'Bildweite', unit: 'm' }
    ],
    explanation: 'Die Linsengleichung beschreibt den Zusammenhang zwischen Brennweite, Gegenstandsweite und Bildweite bei dünnen Linsen.',
    examples: [
      {
        problem: 'Ein Gegenstand befindet sich 30 cm vor einer Sammellinse mit einer Brennweite von 10 cm. In welchem Abstand von der Linse entsteht das Bild?',
        solution: '1/b = 1/f - 1/g = 1/10 cm - 1/30 cm = 0,1 cm⁻¹ - 0,033 cm⁻¹ = 0,067 cm⁻¹; b = 1/0,067 cm⁻¹ = 15 cm'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'f' && variables.g && variables.b) {
        return {
          value: (parseFloat(variables.g) * parseFloat(variables.b)) / (parseFloat(variables.g) + parseFloat(variables.b)),
          unit: 'm'
        };
      } else if (solveFor === 'g' && variables.f && variables.b) {
        return {
          value: (parseFloat(variables.f) * parseFloat(variables.b)) / (parseFloat(variables.b) - parseFloat(variables.f)),
          unit: 'm'
        };
      } else if (solveFor === 'b' && variables.f && variables.g) {
        return {
          value: (parseFloat(variables.f) * parseFloat(variables.g)) / (parseFloat(variables.g) - parseFloat(variables.f)),
          unit: 'm'
        };
      }
      return null;
    }
  },
  // Thermodynamik Formeln
  {
    id: 'waermeenergie',
    name: 'Wärmeenergie',
    latex: 'Q = c \\cdot m \\cdot \\Delta T',
    category: 'thermodynamics',
    level: 'basic',
    variables: [
      { symbol: 'Q', name: 'Wärmeenergie', unit: 'J' },
      { symbol: 'c', name: 'Spezifische Wärmekapazität', unit: 'J/(kg·K)' },
      { symbol: 'm', name: 'Masse', unit: 'kg' },
      { symbol: 'Delta_T', name: 'Temperaturänderung', unit: 'K' }
    ],
    explanation: 'Die Wärmeenergie, die einem Körper zugeführt oder entzogen wird, ist proportional zu seiner Masse, seiner spezifischen Wärmekapazität und der Temperaturänderung.',
    examples: [
      {
        problem: 'Wie viel Energie wird benötigt, um 2 kg Wasser (c = 4190 J/(kg·K)) von 20°C auf 100°C zu erwärmen?',
        solution: 'Q = c·m·ΔT = 4190 J/(kg·K) · 2 kg · 80 K = 670.400 J = 670,4 kJ'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'Q' && variables.c && variables.m && variables.Delta_T) {
        return {
          value: parseFloat(variables.c) * parseFloat(variables.m) * parseFloat(variables.Delta_T),
          unit: 'J'
        };
      } else if (solveFor === 'c' && variables.Q && variables.m && variables.Delta_T) {
        return {
          value: parseFloat(variables.Q) / (parseFloat(variables.m) * parseFloat(variables.Delta_T)),
          unit: 'J/(kg·K)'
        };
      } else if (solveFor === 'm' && variables.Q && variables.c && variables.Delta_T) {
        return {
          value: parseFloat(variables.Q) / (parseFloat(variables.c) * parseFloat(variables.Delta_T)),
          unit: 'kg'
        };
      } else if (solveFor === 'Delta_T' && variables.Q && variables.c && variables.m) {
        return {
          value: parseFloat(variables.Q) / (parseFloat(variables.c) * parseFloat(variables.m)),
          unit: 'K'
        };
      }
      return null;
    }
  },
  {
    id: 'ideales-gasgesetz',
    name: 'Ideales Gasgesetz',
    latex: 'p \\cdot V = n \\cdot R \\cdot T',
    category: 'thermodynamics',
    level: 'advanced',
    variables: [
      { symbol: 'p', name: 'Druck', unit: 'Pa' },
      { symbol: 'V', name: 'Volumen', unit: 'm³' },
      { symbol: 'n', name: 'Stoffmenge', unit: 'mol' },
      { symbol: 'R', name: 'Gaskonstante', unit: 'J/(mol·K)', defaultValue: '8.314' },
      { symbol: 'T', name: 'Absolute Temperatur', unit: 'K' }
    ],
    explanation: 'Das ideale Gasgesetz beschreibt den Zusammenhang zwischen Druck, Volumen, Stoffmenge und Temperatur eines idealen Gases. Es ist eine Kombination aus dem Boyle-Mariotteschen Gesetz, dem Gay-Lussac-Gesetz und dem Avogadroschen Gesetz.',
    examples: [
      {
        problem: 'Welches Volumen nimmt 1 mol eines idealen Gases bei einem Druck von 10⁵ Pa und einer Temperatur von 293 K ein?',
        solution: 'V = (n·R·T)/p = (1 mol · 8,314 J/(mol·K) · 293 K) / 10⁵ Pa ≈ 0,0244 m³ = 24,4 L'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'p' && variables.V && variables.n && variables.R && variables.T) {
        return {
          value: (parseFloat(variables.n) * parseFloat(variables.R) * parseFloat(variables.T)) / parseFloat(variables.V),
          unit: 'Pa'
        };
      } else if (solveFor === 'V' && variables.p && variables.n && variables.R && variables.T) {
        return {
          value: (parseFloat(variables.n) * parseFloat(variables.R) * parseFloat(variables.T)) / parseFloat(variables.p),
          unit: 'm³'
        };
      } else if (solveFor === 'n' && variables.p && variables.V && variables.R && variables.T) {
        return {
          value: (parseFloat(variables.p) * parseFloat(variables.V)) / (parseFloat(variables.R) * parseFloat(variables.T)),
          unit: 'mol'
        };
      } else if (solveFor === 'T' && variables.p && variables.V && variables.n && variables.R) {
        return {
          value: (parseFloat(variables.p) * parseFloat(variables.V)) / (parseFloat(variables.n) * parseFloat(variables.R)),
          unit: 'K'
        };
      }
      return null;
    }
  },
  // Moderne Physik
  {
    id: 'photoeffekt',
    name: 'Photoeffekt',
    latex: 'E_{kin} = h \\cdot f - W_A',
    category: 'modern',
    level: 'advanced',
    variables: [
      { symbol: 'E_kin', name: 'Kinetische Energie der Elektronen', unit: 'eV' },
      { symbol: 'h', name: 'Plancksches Wirkungsquantum', unit: 'eV·s', defaultValue: '4.136e-15' },
      { symbol: 'f', name: 'Frequenz des Lichts', unit: 'Hz' },
      { symbol: 'W_A', name: 'Austrittsarbeit', unit: 'eV' }
    ],
    explanation: 'Der Photoeffekt beschreibt die Emission von Elektronen aus einem Material, wenn es mit Licht bestrahlt wird. Die kinetische Energie der emittierten Elektronen hängt von der Frequenz des Lichts und der materialspezifischen Austrittsarbeit ab.',
    examples: [
      {
        problem: 'Licht mit einer Frequenz von 1,2·10¹⁵ Hz trifft auf eine Metalloberfläche mit einer Austrittsarbeit von 2,3 eV. Wie groß ist die maximale kinetische Energie der emittierten Elektronen?',
        solution: 'E_kin = h·f - W_A = 4,136·10⁻¹⁵ eV·s · 1,2·10¹⁵ Hz - 2,3 eV = 4,96 eV - 2,3 eV = 2,66 eV'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'E_kin' && variables.h && variables.f && variables.W_A) {
        return {
          value: parseFloat(variables.h) * parseFloat(variables.f) - parseFloat(variables.W_A),
          unit: 'eV'
        };
      } else if (solveFor === 'f' && variables.E_kin && variables.h && variables.W_A) {
        return {
          value: (parseFloat(variables.E_kin) + parseFloat(variables.W_A)) / parseFloat(variables.h),
          unit: 'Hz'
        };
      } else if (solveFor === 'W_A' && variables.E_kin && variables.h && variables.f) {
        return {
          value: parseFloat(variables.h) * parseFloat(variables.f) - parseFloat(variables.E_kin),
          unit: 'eV'
        };
      }
      return null;
    }
  },
  {
    id: 'massenenergie-äquivalenz',
    name: 'Masse-Energie-Äquivalenz',
    latex: 'E = m \\cdot c^2',
    category: 'modern',
    level: 'advanced',
    variables: [
      { symbol: 'E', name: 'Energie', unit: 'J' },
      { symbol: 'm', name: 'Masse', unit: 'kg' },
      { symbol: 'c', name: 'Lichtgeschwindigkeit', unit: 'm/s', defaultValue: '299792458' }
    ],
    explanation: 'Die Masse-Energie-Äquivalenz, ausgedrückt durch Einsteins berühmte Formel E = mc², besagt, dass Masse und Energie äquivalent und ineinander umwandelbar sind. Die Energie, die einer bestimmten Masse entspricht, ist das Produkt aus der Masse und dem Quadrat der Lichtgeschwindigkeit.',
    examples: [
      {
        problem: 'Wie viel Energie entspricht einer Masse von 1 kg?',
        solution: 'E = m·c² = 1 kg · (3·10⁸ m/s)² = 9·10¹⁶ J = 90 PJ'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'E' && variables.m && variables.c) {
        return {
          value: parseFloat(variables.m) * Math.pow(parseFloat(variables.c), 2),
          unit: 'J'
        };
      } else if (solveFor === 'm' && variables.E && variables.c) {
        return {
          value: parseFloat(variables.E) / Math.pow(parseFloat(variables.c), 2),
          unit: 'kg'
        };
      }
      return null;
    }
  },
  // Kraftansatz und weitere Grundlagen Mechanik
  {
    id: 'kraftansatz',
    name: 'Kraftansatz',
    latex: '\\vec{F} = m \\cdot \\vec{a}',
    category: 'mechanics',
    level: 'basic',
    variables: [
      { symbol: 'F', name: 'Kraftvektor', unit: 'N' },
      { symbol: 'm', name: 'Masse', unit: 'kg' },
      { symbol: 'a', name: 'Beschleunigungsvektor', unit: 'm/s²' }
    ],
    explanation: 'Der Kraftansatz (auch "Grundgleichung der Mechanik" genannt) basiert auf Newtons zweitem Gesetz und beschreibt, dass die Summe aller auf einen Körper wirkenden Kräfte gleich dem Produkt aus seiner Masse und seiner Beschleunigung ist. In der Vektorform berücksichtigt die Formel, dass Kraft und Beschleunigung gerichtete Größen sind.',
    examples: [
      {
        problem: 'Auf ein Objekt mit der Masse 2 kg wirkt eine Kraft von 10 N. Welche Beschleunigung erfährt das Objekt?',
        solution: 'a = F/m = 10 N / 2 kg = 5 m/s²'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'F' && variables.m && variables.a) {
        return {
          value: parseFloat(variables.m) * parseFloat(variables.a),
          unit: 'N'
        };
      } else if (solveFor === 'm' && variables.F && variables.a) {
        return {
          value: parseFloat(variables.F) / parseFloat(variables.a),
          unit: 'kg'
        };
      } else if (solveFor === 'a' && variables.F && variables.m) {
        return {
          value: parseFloat(variables.F) / parseFloat(variables.m),
          unit: 'm/s²'
        };
      }
      return null;
    }
  },
  {
    id: 'arbeit-mechanisch',
    name: 'Mechanische Arbeit',
    latex: 'W = F \\cdot s \\cdot \\cos(\\alpha)',
    category: 'mechanics',
    level: 'basic',
    variables: [
      { symbol: 'W', name: 'Mechanische Arbeit', unit: 'J' },
      { symbol: 'F', name: 'Kraft', unit: 'N' },
      { symbol: 's', name: 'Weg', unit: 'm' },
      { symbol: 'alpha', name: 'Winkel zwischen Kraft und Weg', unit: '°', defaultValue: '0' }
    ],
    explanation: 'Die mechanische Arbeit ist das Produkt aus Kraft, Weg und dem Kosinus des Winkels zwischen Kraft- und Wegrichtung. Wenn die Kraft in Wegrichtung wirkt (α = 0°), dann ist die Arbeit maximal.',
    examples: [
      {
        problem: 'Eine Kraft von 200 N wirkt auf einen Körper über einen Weg von 5 m. Die Kraft wirkt in einem Winkel von 30° zur Wegrichtung. Wie groß ist die verrichtete Arbeit?',
        solution: 'W = F·s·cos(α) = 200 N · 5 m · cos(30°) = 200 N · 5 m · 0,866 ≈ 866 J'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'W' && variables.F && variables.s && variables.alpha) {
        const alphaRad = parseFloat(variables.alpha) * (Math.PI / 180);
        return {
          value: parseFloat(variables.F) * parseFloat(variables.s) * Math.cos(alphaRad),
          unit: 'J'
        };
      } else if (solveFor === 'F' && variables.W && variables.s && variables.alpha) {
        const alphaRad = parseFloat(variables.alpha) * (Math.PI / 180);
        return {
          value: parseFloat(variables.W) / (parseFloat(variables.s) * Math.cos(alphaRad)),
          unit: 'N'
        };
      } else if (solveFor === 's' && variables.W && variables.F && variables.alpha) {
        const alphaRad = parseFloat(variables.alpha) * (Math.PI / 180);
        return {
          value: parseFloat(variables.W) / (parseFloat(variables.F) * Math.cos(alphaRad)),
          unit: 'm'
        };
      } else if (solveFor === 'alpha' && variables.W && variables.F && variables.s) {
        const cosAlpha = parseFloat(variables.W) / (parseFloat(variables.F) * parseFloat(variables.s));
        return {
          value: Math.acos(cosAlpha) * (180 / Math.PI),
          unit: '°'
        };
      }
      return null;
    }
  },
  {
    id: 'leistung-mechanisch',
    name: 'Mechanische Leistung',
    latex: 'P = \\frac{W}{t} = F \\cdot v',
    category: 'mechanics',
    level: 'basic',
    variables: [
      { symbol: 'P', name: 'Leistung', unit: 'W' },
      { symbol: 'W', name: 'Arbeit', unit: 'J' },
      { symbol: 't', name: 'Zeit', unit: 's' },
      { symbol: 'F', name: 'Kraft', unit: 'N' },
      { symbol: 'v', name: 'Geschwindigkeit', unit: 'm/s' }
    ],
    explanation: 'Die mechanische Leistung ist die pro Zeiteinheit verrichtete Arbeit. Sie kann auch als Produkt aus Kraft und Geschwindigkeit berechnet werden.',
    examples: [
      {
        problem: 'Ein Motor verrichtet in 5 Sekunden eine Arbeit von 2500 J. Welche Leistung hat der Motor?',
        solution: 'P = W/t = 2500 J / 5 s = 500 W'
      },
      {
        problem: 'Ein Auto mit einer Masse von 1200 kg fährt mit konstant 80 km/h. Der Luftwiderstand beträgt 400 N. Welche Leistung muss der Motor aufbringen, um diese Geschwindigkeit beizubehalten?',
        solution: 'P = F·v = 400 N · (80 km/h / 3,6) = 400 N · 22,22 m/s ≈ 8889 W ≈ 8,89 kW'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'P' && variables.W && variables.t) {
        return {
          value: parseFloat(variables.W) / parseFloat(variables.t),
          unit: 'W'
        };
      } else if (solveFor === 'P' && variables.F && variables.v) {
        return {
          value: parseFloat(variables.F) * parseFloat(variables.v),
          unit: 'W'
        };
      } else if (solveFor === 'W' && variables.P && variables.t) {
        return {
          value: parseFloat(variables.P) * parseFloat(variables.t),
          unit: 'J'
        };
      } else if (solveFor === 't' && variables.W && variables.P) {
        return {
          value: parseFloat(variables.W) / parseFloat(variables.P),
          unit: 's'
        };
      } else if (solveFor === 'F' && variables.P && variables.v) {
        return {
          value: parseFloat(variables.P) / parseFloat(variables.v),
          unit: 'N'
        };
      } else if (solveFor === 'v' && variables.P && variables.F) {
        return {
          value: parseFloat(variables.P) / parseFloat(variables.F),
          unit: 'm/s'
        };
      }
      return null;
    }
  },
  {
    id: 'wirkungsgrad',
    name: 'Wirkungsgrad',
    latex: '\\eta = \\frac{P_{ab}}{P_{zu}} = \\frac{E_{nutz}}{E_{zu}}',
    category: 'mechanics',
    level: 'basic',
    variables: [
      { symbol: 'eta', name: 'Wirkungsgrad', unit: '' },
      { symbol: 'P_ab', name: 'Abgegebene Leistung', unit: 'W' },
      { symbol: 'P_zu', name: 'Zugeführte Leistung', unit: 'W' },
      { symbol: 'E_nutz', name: 'Nutzenergie', unit: 'J' },
      { symbol: 'E_zu', name: 'Zugeführte Energie', unit: 'J' }
    ],
    explanation: 'Der Wirkungsgrad ist das Verhältnis von abgegebener zu zugeführter Leistung oder von Nutzenergie zu zugeführter Energie. Er ist dimensionslos und wird oft in Prozent angegeben.',
    examples: [
      {
        problem: 'Ein Elektromotor nimmt 2000 W elektrische Leistung auf und gibt 1700 W mechanische Leistung ab. Wie groß ist sein Wirkungsgrad?',
        solution: 'η = Pab/Pzu = 1700 W / 2000 W = 0,85 = 85%'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'eta' && variables.P_ab && variables.P_zu) {
        return {
          value: parseFloat(variables.P_ab) / parseFloat(variables.P_zu),
          unit: ''
        };
      } else if (solveFor === 'eta' && variables.E_nutz && variables.E_zu) {
        return {
          value: parseFloat(variables.E_nutz) / parseFloat(variables.E_zu),
          unit: ''
        };
      } else if (solveFor === 'P_ab' && variables.eta && variables.P_zu) {
        return {
          value: parseFloat(variables.eta) * parseFloat(variables.P_zu),
          unit: 'W'
        };
      } else if (solveFor === 'P_zu' && variables.eta && variables.P_ab) {
        return {
          value: parseFloat(variables.P_ab) / parseFloat(variables.eta),
          unit: 'W'
        };
      } else if (solveFor === 'E_nutz' && variables.eta && variables.E_zu) {
        return {
          value: parseFloat(variables.eta) * parseFloat(variables.E_zu),
          unit: 'J'
        };
      } else if (solveFor === 'E_zu' && variables.eta && variables.E_nutz) {
        return {
          value: parseFloat(variables.E_nutz) / parseFloat(variables.eta),
          unit: 'J'
        };
      }
      return null;
    }
  },
  {
    id: 'newton-second-law',
    name: 'Newtonsches Kraftgesetz',
    latex: 'F = m \\cdot a',
    category: 'mechanics',
    variables: [
      { symbol: 'F', name: 'Kraft', unit: 'N' },
      { symbol: 'm', name: 'Masse', unit: 'kg' },
      { symbol: 'a', name: 'Beschleunigung', unit: 'm/s²' }
    ],
    explanation: 'Das Newtonsche Kraftgesetz (2. Newtonsches Gesetz) beschreibt den Zusammenhang zwischen der Kraft, die auf einen Körper wirkt, seiner Masse und der resultierenden Beschleunigung. Die Kraft ist proportional zur Beschleunigung und zur Masse des Körpers.',
    examples: [
      {
        problem: 'Eine Kraft von 50 N wirkt auf einen Körper mit einer Masse von 10 kg. Welche Beschleunigung erfährt der Körper?',
        solution: 'Nach F = m·a gilt: a = F/m = 50 N / 10 kg = 5 m/s²'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'F' && variables.m && variables.a) {
        return {
          value: parseFloat(variables.m) * parseFloat(variables.a),
          unit: 'N'
        };
      } else if (solveFor === 'm' && variables.F && variables.a) {
        return {
          value: parseFloat(variables.F) / parseFloat(variables.a),
          unit: 'kg'
        };
      } else if (solveFor === 'a' && variables.F && variables.m) {
        return {
          value: parseFloat(variables.F) / parseFloat(variables.m),
          unit: 'm/s²'
        };
      }
      return null;
    }
  },
  {
    id: 'ohms-law',
    name: 'Ohmsches Gesetz',
    latex: 'U = R \\cdot I',
    category: 'electricity',
    variables: [
      { symbol: 'U', name: 'Elektrische Spannung', unit: 'V' },
      { symbol: 'R', name: 'Elektrischer Widerstand', unit: 'Ω' },
      { symbol: 'I', name: 'Elektrische Stromstärke', unit: 'A' }
    ],
    explanation: 'Das Ohmsche Gesetz beschreibt den Zusammenhang zwischen Spannung, Stromstärke und Widerstand in einem elektrischen Stromkreis. Die Spannung ist gleich dem Produkt aus Stromstärke und Widerstand.',
    examples: [
      {
        problem: 'Welche Stromstärke fließt durch einen Widerstand von 100 Ω, wenn eine Spannung von 230 V anliegt?',
        solution: 'Nach U = R·I gilt: I = U/R = 230 V / 100 Ω = 2,3 A'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'U' && variables.R && variables.I) {
        return {
          value: parseFloat(variables.R) * parseFloat(variables.I),
          unit: 'V'
        };
      } else if (solveFor === 'R' && variables.U && variables.I) {
        return {
          value: parseFloat(variables.U) / parseFloat(variables.I),
          unit: 'Ω'
        };
      } else if (solveFor === 'I' && variables.U && variables.R) {
        return {
          value: parseFloat(variables.U) / parseFloat(variables.R),
          unit: 'A'
        };
      }
      return null;
    }
  },
  {
    id: 'kinetic-energy',
    name: 'Kinetische Energie',
    latex: 'E_{kin} = \\frac{1}{2} \\cdot m \\cdot v^2',
    category: 'mechanics',
    variables: [
      { symbol: 'E_kin', name: 'Kinetische Energie', unit: 'J' },
      { symbol: 'm', name: 'Masse', unit: 'kg' },
      { symbol: 'v', name: 'Geschwindigkeit', unit: 'm/s' }
    ],
    explanation: 'Die kinetische Energie ist die Bewegungsenergie eines Körpers. Sie hängt von der Masse des Körpers und vom Quadrat seiner Geschwindigkeit ab.',
    examples: [
      {
        problem: 'Ein Auto mit einer Masse von 1500 kg fährt mit einer Geschwindigkeit von 20 m/s. Wie groß ist seine kinetische Energie?',
        solution: 'Nach E_kin = (1/2)·m·v² gilt: E_kin = 0,5 · 1500 kg · (20 m/s)² = 0,5 · 1500 kg · 400 m²/s² = 300.000 J = 300 kJ'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'E_kin' && variables.m && variables.v) {
        return {
          value: 0.5 * parseFloat(variables.m) * Math.pow(parseFloat(variables.v), 2),
          unit: 'J'
        };
      } else if (solveFor === 'm' && variables.E_kin && variables.v) {
        return {
          value: (2 * parseFloat(variables.E_kin)) / Math.pow(parseFloat(variables.v), 2),
          unit: 'kg'
        };
      } else if (solveFor === 'v' && variables.E_kin && variables.m) {
        return {
          value: Math.sqrt((2 * parseFloat(variables.E_kin)) / parseFloat(variables.m)),
          unit: 'm/s'
        };
      }
      return null;
    }
  },
  {
    id: 'gravitational-potential-energy',
    name: 'Potentielle Energie im Schwerefeld',
    latex: 'E_{pot} = m \\cdot g \\cdot h',
    category: 'mechanics',
    variables: [
      { symbol: 'E_pot', name: 'Potentielle Energie', unit: 'J' },
      { symbol: 'm', name: 'Masse', unit: 'kg' },
      { symbol: 'g', name: 'Erdbeschleunigung', unit: 'm/s²', defaultValue: '9.81' },
      { symbol: 'h', name: 'Höhe', unit: 'm' }
    ],
    explanation: 'Die potentielle Energie im Schwerefeld beschreibt die Energie, die ein Körper aufgrund seiner Position im Gravitationsfeld besitzt. Sie hängt von der Masse des Körpers, der Erdbeschleunigung und der Höhe ab.',
    examples: [
      {
        problem: 'Ein Buch mit einer Masse von 0,5 kg liegt auf einem 1,5 m hohen Regal. Wie groß ist seine potentielle Energie? (g = 9,81 m/s²)',
        solution: 'Nach E_pot = m·g·h gilt: E_pot = 0,5 kg · 9,81 m/s² · 1,5 m = 7,36 J'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'E_pot' && variables.m && variables.g && variables.h) {
        return {
          value: parseFloat(variables.m) * parseFloat(variables.g) * parseFloat(variables.h),
          unit: 'J'
        };
      } else if (solveFor === 'm' && variables.E_pot && variables.g && variables.h) {
        return {
          value: parseFloat(variables.E_pot) / (parseFloat(variables.g) * parseFloat(variables.h)),
          unit: 'kg'
        };
      } else if (solveFor === 'g' && variables.E_pot && variables.m && variables.h) {
        return {
          value: parseFloat(variables.E_pot) / (parseFloat(variables.m) * parseFloat(variables.h)),
          unit: 'm/s²'
        };
      } else if (solveFor === 'h' && variables.E_pot && variables.m && variables.g) {
        return {
          value: parseFloat(variables.E_pot) / (parseFloat(variables.m) * parseFloat(variables.g)),
          unit: 'm'
        };
      }
      return null;
    }
  },
  {
    id: 'momentum',
    name: 'Impuls',
    latex: 'p = m \\cdot v',
    category: 'mechanics',
    variables: [
      { symbol: 'p', name: 'Impuls', unit: 'kg·m/s' },
      { symbol: 'm', name: 'Masse', unit: 'kg' },
      { symbol: 'v', name: 'Geschwindigkeit', unit: 'm/s' }
    ],
    explanation: 'Der Impuls eines Körpers ist das Produkt aus seiner Masse und seiner Geschwindigkeit. Er ist eine vektorielle Größe und hat die gleiche Richtung wie die Geschwindigkeit.',
    examples: [
      {
        problem: 'Ein Fahrzeug mit einer Masse von 1200 kg bewegt sich mit einer Geschwindigkeit von 25 m/s. Wie groß ist sein Impuls?',
        solution: 'Nach p = m·v gilt: p = 1200 kg · 25 m/s = 30.000 kg·m/s'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'p' && variables.m && variables.v) {
        return {
          value: parseFloat(variables.m) * parseFloat(variables.v),
          unit: 'kg·m/s'
        };
      } else if (solveFor === 'm' && variables.p && variables.v) {
        return {
          value: parseFloat(variables.p) / parseFloat(variables.v),
          unit: 'kg'
        };
      } else if (solveFor === 'v' && variables.p && variables.m) {
        return {
          value: parseFloat(variables.p) / parseFloat(variables.m),
          unit: 'm/s'
        };
      }
      return null;
    }
  },
  {
    id: 'gravitational-force',
    name: 'Gravitationskraft',
    latex: 'F_G = G \\cdot \\frac{m_1 \\cdot m_2}{r^2}',
    category: 'mechanics',
    variables: [
      { symbol: 'F_G', name: 'Gravitationskraft', unit: 'N' },
      { symbol: 'G', name: 'Gravitationskonstante', unit: 'm³/(kg·s²)', defaultValue: '6.67430e-11' },
      { symbol: 'm_1', name: 'Masse 1', unit: 'kg' },
      { symbol: 'm_2', name: 'Masse 2', unit: 'kg' },
      { symbol: 'r', name: 'Abstand', unit: 'm' }
    ],
    explanation: 'Das Newtonsche Gravitationsgesetz beschreibt die Anziehungskraft zwischen zwei Massen. Die Kraft ist proportional zum Produkt der beiden Massen und umgekehrt proportional zum Quadrat ihres Abstands.',
    examples: [
      {
        problem: 'Berechne die Gravitationskraft zwischen der Erde (5,97·10²⁴ kg) und dem Mond (7,35·10²² kg) bei einem Abstand von 3,84·10⁸ m.',
        solution: 'Nach F = G·(m₁·m₂)/r² ergibt sich: F = 6,67·10⁻¹¹ m³/(kg·s²) · (5,97·10²⁴ kg · 7,35·10²² kg) / (3,84·10⁸ m)² ≈ 1,98·10²⁰ N'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'F_G' && variables.G && variables.m_1 && variables.m_2 && variables.r) {
        return {
          value: parseFloat(variables.G) * parseFloat(variables.m_1) * parseFloat(variables.m_2) / Math.pow(parseFloat(variables.r), 2),
          unit: 'N'
        };
      } else if (solveFor === 'G' && variables.F_G && variables.m_1 && variables.m_2 && variables.r) {
        return {
          value: parseFloat(variables.F_G) * Math.pow(parseFloat(variables.r), 2) / (parseFloat(variables.m_1) * parseFloat(variables.m_2)),
          unit: 'm³/(kg·s²)'
        };
      } else if (solveFor === 'm_1' && variables.F_G && variables.G && variables.m_2 && variables.r) {
        return {
          value: parseFloat(variables.F_G) * Math.pow(parseFloat(variables.r), 2) / (parseFloat(variables.G) * parseFloat(variables.m_2)),
          unit: 'kg'
        };
      } else if (solveFor === 'm_2' && variables.F_G && variables.G && variables.m_1 && variables.r) {
        return {
          value: parseFloat(variables.F_G) * Math.pow(parseFloat(variables.r), 2) / (parseFloat(variables.G) * parseFloat(variables.m_1)),
          unit: 'kg'
        };
      } else if (solveFor === 'r' && variables.F_G && variables.G && variables.m_1 && variables.m_2) {
        return {
          value: Math.sqrt(parseFloat(variables.G) * parseFloat(variables.m_1) * parseFloat(variables.m_2) / parseFloat(variables.F_G)),
          unit: 'm'
        };
      }
      return null;
    }
  },
  {
    id: 'lorentz-force',
    name: 'Lorentzkraft',
    latex: 'F_L = q \\cdot v \\cdot B',
    category: 'electricity',
    variables: [
      { symbol: 'F_L', name: 'Lorentzkraft', unit: 'N' },
      { symbol: 'q', name: 'Ladung', unit: 'C' },
      { symbol: 'v', name: 'Geschwindigkeit', unit: 'm/s' },
      { symbol: 'B', name: 'Magnetische Flussdichte', unit: 'T' }
    ],
    explanation: 'Die Lorentzkraft beschreibt die Kraft, die auf eine bewegte elektrische Ladung in einem Magnetfeld wirkt. Sie ist proportional zur Ladung, zur Geschwindigkeit und zur magnetischen Flussdichte.',
    examples: [
      {
        problem: 'Ein Elektron mit der Ladung -1,6·10⁻¹⁹ C bewegt sich mit einer Geschwindigkeit von 2·10⁶ m/s senkrecht zu einem Magnetfeld mit der Flussdichte 0,5 T. Wie groß ist die Lorentzkraft?',
        solution: 'Nach F = q·v·B ergibt sich: F = 1,6·10⁻¹⁹ C · 2·10⁶ m/s · 0,5 T = 1,6·10⁻¹³ N'
      }
    ],
    calculate: function(variables, solveFor) {
      if (solveFor === 'F_L' && variables.q && variables.v && variables.B) {
        return {
          value: Math.abs(parseFloat(variables.q) * parseFloat(variables.v) * parseFloat(variables.B)),
          unit: 'N'
        };
      } else if (solveFor === 'q' && variables.F_L && variables.v && variables.B) {
        return {
          value: parseFloat(variables.F_L) / (parseFloat(variables.v) * parseFloat(variables.B)),
          unit: 'C'
        };
      } else if (solveFor === 'v' && variables.F_L && variables.q && variables.B) {
        return {
          value: parseFloat(variables.F_L) / (Math.abs(parseFloat(variables.q)) * parseFloat(variables.B)),
          unit: 'm/s'
        };
      } else if (solveFor === 'B' && variables.F_L && variables.q && variables.v) {
        return {
          value: parseFloat(variables.F_L) / (Math.abs(parseFloat(variables.q)) * parseFloat(variables.v)),
          unit: 'T'
        };
      }
      return null;
    }
  }
];

// Data: Physics Topics
const topics = [
  // Basierend auf dem Bild: 1. Das Gravitationsfeld
  {
    id: 'gravitationsfeld',
    name: 'Das Gravitationsfeld',
    category: 'mechanics',
    level: 'advanced',
    shortDescription: 'Das Gravitationsfeld beschreibt die Kraftwirkung zwischen Massen und erklärt Phänomene wie Planetenbewegungen, Gezeiten und die Erdanziehungskraft.',
    introduction: 'Das Gravitationsfeld ist ein fundamentales Konzept in der Physik, das die Wechselwirkung zwischen Massen beschreibt. Es wurde maßgeblich von Isaac Newton mit seinem Gravitationsgesetz formuliert und später durch Albert Einsteins Allgemeine Relativitätstheorie erweitert.',
    explanation: `
      <h5>Das Newtonsche Gravitationsgesetz</h5>
      <p>Das Newtonsche Gravitationsgesetz beschreibt die Anziehungskraft zwischen zwei Massen. Die Kraft ist proportional zum Produkt der beiden Massen und umgekehrt proportional zum Quadrat ihres Abstands.</p>
      <p>Mathematisch ausgedrückt: F = G · (m₁ · m₂) / r²</p>
      <p>Dabei ist G die Gravitationskonstante mit dem Wert 6,67430 · 10⁻¹¹ m³/(kg·s²).</p>
      
      <h5>Das Gravitationsfeld</h5>
      <p>Ein Gravitationsfeld ist ein Kraftfeld, das von einer Masse erzeugt wird. Jede Masse im Universum erzeugt ein Gravitationsfeld, das auf andere Massen wirkt. Die Stärke des Gravitationsfeldes (Feldstärke) an einem bestimmten Punkt wird durch die Gravitationsbeschleunigung g beschrieben.</p>
      <p>g = G · M / r²</p>
      <p>Dabei ist M die felderzeugende Masse und r der Abstand zum Massenmittelpunkt.</p>
      
      <h5>Potentielle Energie im Gravitationsfeld</h5>
      <p>Die potentielle Energie eines Körpers im Gravitationsfeld ist die Energie, die aufgrund seiner Position im Feld gespeichert ist. Sie wird berechnet als:</p>
      <p>E_pot = -G · (m · M) / r</p>
      
      <h5>Gravitationsfeld der Erde</h5>
      <p>Die Erdbeschleunigung beträgt etwa 9,81 m/s² an der Erdoberfläche. Sie variiert leicht je nach geografischer Breite und Höhe über dem Meeresspiegel. An den Polen ist g größer als am Äquator, und mit zunehmender Höhe nimmt g ab.</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Fallbewegung</h6>
        <p>Ein Ball, der aus 20 m Höhe fallen gelassen wird, erreicht nach t = √(2h/g) = √(2·20m/9,81m/s²) ≈ 2,02 s den Boden und hat dann eine Geschwindigkeit von v = g·t = 9,81 m/s² · 2,02 s ≈ 19,8 m/s.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Planetenbewegung</h6>
        <p>Die Erde umkreist die Sonne auf einer nahezu kreisförmigen Bahn. Die Gravitationskraft der Sonne liefert die notwendige Zentripetalkraft, um die Erde auf ihrer Bahn zu halten.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Gezeiten</h6>
        <p>Die Gezeiten (Ebbe und Flut) entstehen hauptsächlich durch die unterschiedliche Stärke des Gravitationsfeldes des Mondes an verschiedenen Punkten der Erde.</p>
      </div>
    `,
    relatedFormulas: ['gravitational-force', 'gravitational-potential-energy', 'newton-second-law'],
    relatedTopics: ['elektrische-feld', 'magnetische-feld', 'ladungen-in-feldern']
  },
  
  // Basierend auf dem Bild: 2. Das elektrische Feld
  {
    id: 'elektrische-feld',
    name: 'Das elektrische Feld',
    category: 'electricity',
    level: 'advanced',
    shortDescription: 'Das elektrische Feld beschreibt die Kraftwirkung zwischen elektrischen Ladungen und erklärt die Wechselwirkung zwischen geladenen Teilchen.',
    introduction: 'Das elektrische Feld ist ein fundamentales Konzept der Elektrodynamik, das beschreibt, wie elektrische Ladungen aufeinander wirken. Es wurde maßgeblich von Michael Faraday entwickelt und später durch James Clerk Maxwell mathematisch formalisiert.',
    explanation: `
      <h5>Das Coulombsche Gesetz</h5>
      <p>Das Coulombsche Gesetz beschreibt die Kraft zwischen zwei Punktladungen. Die Kraft ist proportional zum Produkt der beiden Ladungen und umgekehrt proportional zum Quadrat ihres Abstands.</p>
      <p>Mathematisch ausgedrückt: F = k · (q₁ · q₂) / r²</p>
      <p>Dabei ist k die Coulomb-Konstante mit dem Wert 8,99 · 10⁹ N·m²/C².</p>
      
      <h5>Das elektrische Feld</h5>
      <p>Ein elektrisches Feld ist ein Kraftfeld, das von einer elektrischen Ladung erzeugt wird. Jede elektrische Ladung erzeugt ein elektrisches Feld, das auf andere Ladungen wirkt. Die Stärke des elektrischen Feldes (Feldstärke) an einem bestimmten Punkt wird durch den Vektor E beschrieben.</p>
      <p>E = F / q = k · Q / r²</p>
      <p>Dabei ist Q die felderzeugende Ladung und r der Abstand zur Ladung.</p>
      
      <h5>Elektrisches Potential</h5>
      <p>Das elektrische Potential ist eine skalare Größe, die die potentielle Energie pro Ladungseinheit angibt. Es wird berechnet als:</p>
      <p>φ = k · Q / r</p>
      <p>Die elektrische Feldstärke E ist der negative Gradient des elektrischen Potentials: E = -∇φ</p>
      
      <h5>Elektrische Feldlinien</h5>
      <p>Elektrische Feldlinien sind eine grafische Darstellung des elektrischen Feldes. Sie verlaufen von positiven zu negativen Ladungen und zeigen in jedem Punkt die Richtung der Kraft an, die auf eine positive Probeladung wirkt.</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Punktladung</h6>
        <p>Eine positive Punktladung von Q = 1 nC erzeugt in einem Abstand von 10 cm eine elektrische Feldstärke von E = k·Q/r² = 8,99·10⁹ N·m²/C² · 10⁻⁹ C / (0,1 m)² = 900 N/C.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Plattenkondensator</h6>
        <p>In einem Plattenkondensator mit einem Plattenabstand von 1 cm und einer Spannung von 100 V beträgt die elektrische Feldstärke E = U/d = 100 V / 0,01 m = 10.000 V/m = 10 kV/m.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Elektronenablenkung</h6>
        <p>Ein Elektron, das in ein elektrisches Feld eintritt, erfährt eine Kraft F = q·E, die es in Richtung der positiven Elektrode beschleunigt.</p>
      </div>
    `,
    relatedFormulas: ['coulombsches-gesetz', 'elektrisches-feld', 'lorentz-force'],
    relatedTopics: ['gravitationsfeld', 'magnetische-feld', 'ladungen-in-feldern', 'elektrostatik']
  },
  
  // Basierend auf dem Bild: 3. Das magnetische Feld
  {
    id: 'magnetische-feld',
    name: 'Das magnetische Feld',
    category: 'electricity',
    level: 'advanced',
    shortDescription: 'Das magnetische Feld beschreibt die Wechselwirkung zwischen Magneten, bewegten Ladungen und stromdurchflossenen Leitern.',
    introduction: 'Das magnetische Feld ist ein fundamentales Konzept der Elektrodynamik und beschreibt die Wechselwirkung zwischen Magneten und bewegten elektrischen Ladungen. Es ist eng mit dem elektrischen Feld verbunden und bildet mit diesem das elektromagnetische Feld.',
    explanation: `
      <h5>Die magnetische Kraft</h5>
      <p>Ein bewegtes elektrisch geladenes Teilchen, das sich durch ein Magnetfeld bewegt, erfährt die Lorentzkraft. Diese Kraft steht senkrecht sowohl zur Bewegungsrichtung des Teilchens als auch zur Richtung des Magnetfeldes.</p>
      <p>F = q · v × B</p>
      <p>Dabei ist q die Ladung des Teilchens, v seine Geschwindigkeit und B die magnetische Flussdichte.</p>
      
      <h5>Erzeugung magnetischer Felder</h5>
      <p>Magnetische Felder werden durch bewegte elektrische Ladungen (elektrische Ströme) erzeugt. Ein stromdurchflossener Leiter erzeugt ein zirkulares magnetisches Feld um den Leiter herum.</p>
      <p>Für einen geraden Leiter gilt: B = (μ₀ · I) / (2π · r)</p>
      <p>Dabei ist μ₀ die magnetische Feldkonstante, I die Stromstärke und r der Abstand zum Leiter.</p>
      
      <h5>Elektromagnetische Induktion</h5>
      <p>Die elektromagnetische Induktion beschreibt die Erzeugung einer elektrischen Spannung in einem geschlossenen Leiterkreis durch ein sich änderndes Magnetfeld. Dieses Prinzip ist die Grundlage für Elektromotoren und Generatoren.</p>
      <p>Die induzierte Spannung ist proportional zur zeitlichen Änderung des magnetischen Flusses: U_ind = -dΦ/dt</p>
      
      <h5>Magnetische Feldlinien</h5>
      <p>Magnetische Feldlinien sind geschlossene Kurven, die vom magnetischen Nordpol zum Südpol außerhalb des Magneten und vom Südpol zum Nordpol innerhalb des Magneten verlaufen.</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Stromleiter</h6>
        <p>Ein gerader Leiter, durch den ein Strom von 10 A fließt, erzeugt in einem Abstand von 5 cm ein Magnetfeld mit der Flussdichte B = (μ₀ · I) / (2π · r) = (1,257 · 10⁻⁶ N/A² · 10 A) / (2π · 0,05 m) ≈ 4 · 10⁻⁵ T = 40 μT.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Spule</h6>
        <p>Eine Spule mit 200 Windungen und einer Länge von 15 cm erzeugt bei einem Strom von 2 A ein Magnetfeld im Inneren mit der Flussdichte B = μ₀ · (n · I) / l = 1,257 · 10⁻⁶ N/A² · (200 · 2 A) / 0,15 m ≈ 3,35 · 10⁻³ T = 3,35 mT.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Kreisbewegung im Magnetfeld</h6>
        <p>Ein Elektron, das senkrecht zu einem homogenen Magnetfeld mit der Flussdichte B = 0,1 T eintritt, beschreibt eine Kreisbahn mit dem Radius r = (m · v) / (q · B), wobei m die Masse des Elektrons, v seine Geschwindigkeit und q seine Ladung ist.</p>
      </div>
    `,
    relatedFormulas: ['lorentz-force', 'magnetisches-feld-gerader-leiter', 'magnetisches-feld-spule'],
    relatedTopics: ['gravitationsfeld', 'elektrische-feld', 'ladungen-in-feldern', 'elektromagnetismus']
  },
  
  // Basierend auf dem Bild: 4. Ladungen in Feldern
  {
    id: 'ladungen-in-feldern',
    name: 'Ladungen in Feldern',
    category: 'electricity',
    level: 'advanced',
    shortDescription: 'Die Bewegung elektrischer Ladungen in elektrischen und magnetischen Feldern erklärt zahlreiche technische Anwendungen wie Oszilloskope, Teilchenbeschleuniger und Massenspektrometer.',
    introduction: 'Die Bewegung geladener Teilchen in elektrischen und magnetischen Feldern ist ein zentrales Thema der Elektrodynamik mit vielen praktischen Anwendungen. Die Wechselwirkung zwischen Ladungen und Feldern erklärt das Verhalten von Elektronen in Kathodenstrahlröhren, Protonen in Teilchenbeschleunigern und Ionen in Massenspektrometern.',
    explanation: `
      <h5>Bewegung im elektrischen Feld</h5>
      <p>Ein geladenes Teilchen im elektrischen Feld erfährt eine Kraft in Richtung des Feldes (für positive Ladungen) oder entgegen der Feldrichtung (für negative Ladungen). Die Kraft ist gegeben durch:</p>
      <p>F = q · E</p>
      <p>Diese Kraft führt zu einer Beschleunigung des Teilchens: a = (q · E) / m</p>
      <p>In einem homogenen elektrischen Feld bewegt sich das Teilchen auf einer Parabel, ähnlich wie ein schräg geworfener Körper im Gravitationsfeld.</p>
      
      <h5>Bewegung im magnetischen Feld</h5>
      <p>Ein geladenes Teilchen, das sich in einem Magnetfeld bewegt, erfährt die Lorentzkraft, die senkrecht zur Bewegungsrichtung und zur Richtung des Magnetfeldes steht.</p>
      <p>F = q · v × B</p>
      <p>Bei einer Bewegung senkrecht zum Magnetfeld führt dies zu einer Kreisbewegung mit dem Radius: r = (m · v) / (|q| · B)</p>
      <p>Die Frequenz dieser Kreisbewegung (Zyklotronfrequenz) ist: f = (|q| · B) / (2π · m)</p>
      
      <h5>Bewegung in elektrischen und magnetischen Feldern</h5>
      <p>Wenn ein geladenes Teilchen gleichzeitig elektrischen und magnetischen Feldern ausgesetzt ist, erfährt es die kombinierte Lorentzkraft:</p>
      <p>F = q · (E + v × B)</p>
      <p>Diese Wechselwirkung wird in zahlreichen technischen Anwendungen genutzt, wie z.B. im Wien-Filter zur Geschwindigkeitsselektion von geladenen Teilchen.</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Elektronenkanone</h6>
        <p>In einer Elektronenkanone werden Elektronen durch ein elektrisches Feld mit einer Spannung von 5 kV beschleunigt. Die kinetische Energie der Elektronen beträgt dann Ekin = e · U = 1,6 · 10⁻¹⁹ C · 5000 V = 8 · 10⁻¹⁶ J = 5 keV.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Massenspektrometer</h6>
        <p>In einem Massenspektrometer werden Ionen in einem Magnetfeld auf Kreisbahnen gelenkt. Bei gleicher Geschwindigkeit ist der Radius proportional zur Masse: r ∝ m/q. Dies ermöglicht die Trennung von Ionen nach ihrem Masse-zu-Ladungs-Verhältnis.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Hall-Effekt</h6>
        <p>Beim Hall-Effekt bewegen sich Ladungsträger in einem stromdurchflossenen Leiter, der sich in einem Magnetfeld befindet. Die Lorentzkraft führt zu einer Ladungstrennung und erzeugt eine Spannung senkrecht zur Stromrichtung und zum Magnetfeld.</p>
      </div>
    `,
    relatedFormulas: ['lorentz-force', 'elektrisches-feld', 'magnetisches-feld-spule'],
    relatedTopics: ['gravitationsfeld', 'elektrische-feld', 'magnetische-feld', 'elektromagnetismus', 'teilchenphysik']
  },
  
  // Basierend auf dem Bild: 5. Elektrostatik
  {
    id: 'elektrostatik',
    name: 'Elektrostatik',
    category: 'electricity',
    level: 'basic',
    shortDescription: 'Die Elektrostatik behandelt ruhende elektrische Ladungen und die von ihnen erzeugten elektrischen Felder und Kräfte.',
    introduction: 'Die Elektrostatik ist das Teilgebiet der Physik, das sich mit ruhenden elektrischen Ladungen, elektrischen Feldern und elektrostatischen Kräften beschäftigt. Sie bildet die Grundlage für viele technische Anwendungen wie Kondensatoren, elektrostatische Präzipitoren und Photokopierer.',
    explanation: `
      <h5>Elektrische Ladungen</h5>
      <p>Materie besteht aus Atomen, die Elektronen (negativ geladen), Protonen (positiv geladen) und Neutronen (ungeladen) enthalten. Die elektrische Ladung ist quantisiert und tritt in ganzzahligen Vielfachen der Elementarladung e = 1,602 · 10⁻¹⁹ C auf.</p>
      <p>Gleichnamige Ladungen stoßen sich ab, ungleichnamige ziehen sich an. Die Gesamtladung in einem geschlossenen System bleibt erhalten (Ladungserhaltungssatz).</p>
      
      <h5>Coulombsches Gesetz</h5>
      <p>Das Coulombsche Gesetz beschreibt die Kraft zwischen zwei Punktladungen. Sie ist proportional zum Produkt der Ladungen und umgekehrt proportional zum Quadrat ihres Abstands:</p>
      <p>F = k · (q₁ · q₂) / r²</p>
      <p>mit k = 1/(4πε₀) = 8,99 · 10⁹ N·m²/C²</p>
      
      <h5>Elektrisches Feld</h5>
      <p>Das elektrische Feld beschreibt die Kraft, die auf eine Probeladung wirkt, dividiert durch den Wert dieser Ladung:</p>
      <p>E = F/q</p>
      <p>Die Einheit des elektrischen Feldes ist V/m oder N/C.</p>
      
      <h5>Elektrostatisches Potential</h5>
      <p>Das elektrostatische Potential ist die potentielle Energie pro Ladungseinheit und wird in Volt (V) gemessen. Es ist eine skalare Größe und ist definiert als:</p>
      <p>φ = k · q / r</p>
      <p>Die Potentialdifferenz zwischen zwei Punkten wird als elektrische Spannung bezeichnet.</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Ladungstrennung</h6>
        <p>Beim Reiben eines Kunststoffstabs mit einem Wolltuch werden negative Ladungen (Elektronen) vom Tuch auf den Stab übertragen. Der Stab wird negativ geladen, das Tuch positiv.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Kondensator</h6>
        <p>Ein Plattenkondensator mit einer Kapazität von 10 μF wird auf eine Spannung von 12 V aufgeladen. Die gespeicherte Ladung beträgt Q = C · U = 10 · 10⁻⁶ F · 12 V = 1,2 · 10⁻⁴ C.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Erdung</h6>
        <p>Bei der Erdung wird ein elektrisch geladener Körper mit der Erde verbunden, wodurch überschüssige Ladungen abfließen können. Die Erde dient als nahezu unendlich großer Ladungsreservoir mit einem Potential von 0 V.</p>
      </div>
    `,
    relatedFormulas: ['coulombsches-gesetz', 'elektrisches-feld'],
    relatedTopics: ['elektrische-feld', 'ladungen-in-feldern', 'kondensatoren']
  },
  
  // Weitere wichtige Themen für die Grundlagen
  
  // Mechanik Grundlagen
  {
    id: 'kinematik',
    name: 'Kinematik',
    category: 'mechanics',
    level: 'basic',
    shortDescription: 'Die Kinematik beschreibt die Bewegung von Körpern ohne Berücksichtigung der Ursachen der Bewegung (Kräfte).',
    introduction: 'Die Kinematik ist ein Teilgebiet der Mechanik, das sich mit der Beschreibung der Bewegung von Körpern befasst, ohne die Ursachen der Bewegung zu betrachten. Sie untersucht Konzepte wie Position, Geschwindigkeit und Beschleunigung sowie verschiedene Arten von Bewegungen.',
    explanation: `
      <h5>Gleichförmige Bewegung</h5>
      <p>Bei der gleichförmigen (geradlinigen) Bewegung bleibt die Geschwindigkeit konstant. Es gilt:</p>
      <p>v = s / t bzw. s = v · t</p>
      <p>Dabei ist v die Geschwindigkeit, s der zurückgelegte Weg und t die dafür benötigte Zeit.</p>
      
      <h5>Gleichmäßig beschleunigte Bewegung</h5>
      <p>Bei der gleichmäßig beschleunigten Bewegung ändert sich die Geschwindigkeit gleichmäßig mit der Zeit. Die Beschleunigung ist konstant. Es gelten folgende Gleichungen:</p>
      <p>v(t) = v₀ + a · t</p>
      <p>s(t) = v₀ · t + (1/2) · a · t²</p>
      <p>v² = v₀² + 2 · a · s</p>
      <p>Dabei ist v₀ die Anfangsgeschwindigkeit, a die Beschleunigung, t die Zeit und s der zurückgelegte Weg.</p>
      
      <h5>Kreisbewegung</h5>
      <p>Bei der Kreisbewegung bewegt sich ein Körper auf einer Kreisbahn. Wichtige Größen sind:</p>
      <p>Bahngeschwindigkeit: v = 2π · r / T</p>
      <p>Winkelgeschwindigkeit: ω = 2π / T</p>
      <p>Zentripetalbeschleunigung: a_z = v² / r = ω² · r</p>
      <p>Dabei ist r der Radius der Kreisbahn, T die Umlaufzeit und ω die Winkelgeschwindigkeit.</p>
      
      <h5>Wurfbewegung</h5>
      <p>Die Wurfbewegung ist eine Überlagerung einer gleichförmigen Bewegung in horizontaler Richtung und einer gleichmäßig beschleunigten Bewegung in vertikaler Richtung (Fallbewegung).</p>
      <p>Für den horizontalen Wurf gilt: x(t) = v₀ · t und y(t) = (1/2) · g · t²</p>
      <p>Für den schiefen Wurf gilt: x(t) = v₀ · cos(α) · t und y(t) = v₀ · sin(α) · t - (1/2) · g · t²</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Gleichförmige Bewegung</h6>
        <p>Ein Auto fährt mit einer konstanten Geschwindigkeit von 90 km/h. In 20 Minuten legt es eine Strecke von s = v · t = 90 km/h · (20/60) h = 30 km zurück.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Beschleunigte Bewegung</h6>
        <p>Ein Auto beschleunigt gleichmäßig aus dem Stand mit 2 m/s². Nach 10 Sekunden hat es eine Geschwindigkeit von v = v₀ + a · t = 0 + 2 m/s² · 10 s = 20 m/s erreicht und dabei eine Strecke von s = (1/2) · a · t² = 0,5 · 2 m/s² · (10 s)² = 100 m zurückgelegt.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Horizontaler Wurf</h6>
        <p>Ein Ball wird horizontal mit einer Geschwindigkeit von 5 m/s von einem 20 m hohen Turm geworfen. Die Flugzeit beträgt t = √(2h/g) = √(2 · 20 m / 9,81 m/s²) ≈ 2,02 s. In dieser Zeit legt der Ball horizontal eine Strecke von x = v₀ · t = 5 m/s · 2,02 s ≈ 10,1 m zurück.</p>
      </div>
    `,
    relatedFormulas: ['geschwindigkeit', 'beschleunigte-bewegung', 'fallbeschleunigung'],
    relatedTopics: ['dynamik', 'kreisbewegung', 'gravitationsfeld']
  },
  {
    id: 'elektrische-feld',
    name: 'Das elektrische Feld',
    category: 'electricity',
    level: 'advanced',
    shortDescription: 'Das elektrische Feld beschreibt den Raum um elektrische Ladungen, in dem Kraftwirkungen auf andere Ladungen auftreten.',
    introduction: 'Das elektrische Feld ist ein grundlegendes Konzept der Elektrodynamik. Es beschreibt, wie elektrische Ladungen aufeinander wirken und wie sie Kräfte auf andere Ladungen ausüben, selbst wenn kein direkter Kontakt besteht.',
    explanation: `
      <h5>Definition des elektrischen Feldes</h5>
      <p>Ein elektrisches Feld ist ein Kraftfeld, das von elektrischen Ladungen erzeugt wird. Es übt Kräfte auf andere elektrische Ladungen aus, die sich in diesem Feld befinden.</p>
      <p>Die elektrische Feldstärke E an einem Punkt ist definiert als die Kraft F, die auf eine positive Probeladung q wirkt, geteilt durch diese Ladung: E = F/q</p>
      <p>Die Einheit der elektrischen Feldstärke ist N/C (Newton pro Coulomb) oder V/m (Volt pro Meter).</p>
      
      <h5>Coulombsches Gesetz</h5>
      <p>Das Coulombsche Gesetz beschreibt die Kraft zwischen zwei Punktladungen. Es besagt, dass die Kraft proportional zum Produkt der Ladungen und umgekehrt proportional zum Quadrat ihres Abstands ist:</p>
      <p>F = k · (q₁ · q₂) / r²</p>
      <p>Dabei ist k die elektrische Konstante mit k = 1/(4πε₀) = 8,99 · 10⁹ N·m²/C²</p>
      
      <h5>Elektrische Feldlinien</h5>
      <p>Elektrische Felder werden oft durch Feldlinien visualisiert. Diese Linien zeigen die Richtung der Kraft an, die auf eine positive Probeladung wirken würde. Die Dichte der Feldlinien gibt die Stärke des Feldes an.</p>
      <p>Feldlinien beginnen immer bei positiven Ladungen und enden bei negativen Ladungen. Bei einer positiven Ladung verlaufen sie radial nach außen, bei einer negativen Ladung radial nach innen.</p>
      
      <h5>Elektrisches Potential</h5>
      <p>Das elektrische Potential V ist die potentielle Energie pro Ladungseinheit. Die Potentialdifferenz zwischen zwei Punkten (elektrische Spannung) gibt an, wie viel Arbeit pro Ladungseinheit verrichtet werden muss, um eine Ladung von einem Punkt zum anderen zu bewegen.</p>
      <p>Die Einheit des elektrischen Potentials ist Volt (V).</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Elektrisches Feld einer Punktladung</h6>
        <p>Das elektrische Feld einer Punktladung Q im Abstand r beträgt E = k·Q/r². Für eine Ladung von 1 μC im Abstand von 10 cm beträgt die Feldstärke: E = 8,99·10⁹ N·m²/C² · 10⁻⁶ C / (0,1 m)² = 8,99·10⁵ N/C.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Homogenes elektrisches Feld</h6>
        <p>Zwischen zwei parallelen, entgegengesetzt geladenen Platten entsteht ein näherungsweise homogenes elektrisches Feld. Die Feldstärke beträgt E = U/d, wobei U die Spannung zwischen den Platten und d ihr Abstand ist.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Kraft auf eine Ladung im elektrischen Feld</h6>
        <p>Eine Ladung von 2 μC befindet sich in einem elektrischen Feld mit der Stärke 500 V/m. Die Kraft auf die Ladung beträgt F = q·E = 2·10⁻⁶ C · 500 N/C = 10⁻³ N = 1 mN.</p>
      </div>
    `,
    relatedFormulas: ['ohms-law', 'electric-field-strength'],
    relatedTopics: ['gravitationsfeld', 'magnetische-feld', 'elektromagnetische-induktion']
  },
  
  // Basierend auf dem Bild: 3. Das magnetische Feld
  {
    id: 'magnetische-feld',
    name: 'Das magnetische Feld',
    category: 'electricity',
    shortDescription: 'Das magnetische Feld beschreibt die Kraftwirkung zwischen Magneten und bewegten elektrischen Ladungen.',
    introduction: 'Das magnetische Feld ist eines der fundamentalen Felder in der Physik. Es wird von bewegten elektrischen Ladungen (elektrischen Strömen) oder Permanentmagneten erzeugt und übt Kräfte auf bewegte Ladungen und andere Magnete aus.',
    explanation: `
      <h5>Entstehung magnetischer Felder</h5>
      <p>Magnetische Felder werden durch bewegte elektrische Ladungen (Ströme) oder durch die Ausrichtung der magnetischen Momente von Elementarteilchen (wie in Permanentmagneten) erzeugt.</p>
      <p>Ein elektrischer Strom, der durch einen Leiter fließt, erzeugt ein magnetisches Feld um den Leiter herum. Die Richtung des Feldes kann mit der Rechte-Hand-Regel bestimmt werden.</p>
      
      <h5>Magnetische Feldstärke und Flussdichte</h5>
      <p>Die magnetische Feldstärke H beschreibt die Stärke eines magnetischen Feldes unabhängig vom Medium, in dem es sich befindet. Sie wird in der Einheit A/m (Ampere pro Meter) gemessen.</p>
      <p>Die magnetische Flussdichte B berücksichtigt zusätzlich die magnetischen Eigenschaften des Mediums. Sie wird in der Einheit Tesla (T) oder Gauß (G) gemessen, wobei 1 T = 10.000 G.</p>
      <p>Die Beziehung zwischen H und B ist: B = μ·H, wobei μ die magnetische Permeabilität des Mediums ist.</p>
      
      <h5>Magnetische Feldlinien</h5>
      <p>Magnetische Felder werden durch Feldlinien dargestellt. Bei einem Stabmagneten verlaufen sie vom Nordpol zum Südpol außerhalb des Magneten und vom Südpol zum Nordpol innerhalb des Magneten.</p>
      <p>Magnetische Feldlinien sind immer geschlossen und haben keinen Anfang oder Ende, da es keine magnetischen Monopole gibt.</p>
      
      <h5>Lorentzkraft</h5>
      <p>Die Lorentzkraft beschreibt die Kraft auf eine bewegte elektrische Ladung in einem magnetischen Feld. Sie ist proportional zur Ladung, zur Geschwindigkeit der Ladung und zur Flussdichte des magnetischen Feldes.</p>
      <p>F = q · (v × B), wobei q die Ladung, v die Geschwindigkeit und B die magnetische Flussdichte ist. Das Kreuzprodukt bedeutet, dass die Kraft senkrecht zur Bewegungsrichtung und senkrecht zur Richtung des magnetischen Feldes wirkt.</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Magnetfeld eines Leiters</h6>
        <p>Das magnetische Feld eines geraden Leiters mit dem Strom I im Abstand r beträgt B = (μ₀·I)/(2π·r). Für einen Strom von 10 A im Abstand von 5 cm beträgt die Flussdichte: B = (4π·10⁻⁷ T·m/A · 10 A)/(2π·0,05 m) = 4·10⁻⁵ T.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Kraft auf einen stromdurchflossenen Leiter</h6>
        <p>Auf einen geraden Leiter der Länge l mit dem Strom I in einem homogenen Magnetfeld mit der Flussdichte B wirkt die Kraft F = I·l·B·sin(α), wobei α der Winkel zwischen dem Leiter und dem Magnetfeld ist.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Bewegte Ladung im Magnetfeld</h6>
        <p>Ein Elektron mit der Geschwindigkeit v = 10⁶ m/s bewegt sich senkrecht zu einem magnetischen Feld mit B = 0,1 T. Die Lorentzkraft beträgt F = q·v·B = 1,6·10⁻¹⁹ C · 10⁶ m/s · 0,1 T = 1,6·10⁻¹⁴ N.</p>
      </div>
    `,
    relatedFormulas: ['magnetic-flux-density', 'lorentz-force'],
    relatedTopics: ['elektrische-feld', 'elektromagnetische-induktion', 'ladungen-in-feldern']
  },
  
  // Basierend auf dem Bild: 4. Ladungen in Feldern
  {
    id: 'ladungen-in-feldern',
    name: 'Ladungen in Feldern',
    category: 'electricity',
    shortDescription: 'Das Verhalten elektrischer Ladungen in elektrischen und magnetischen Feldern und die daraus resultierenden Kraftwirkungen und Bewegungen.',
    introduction: 'Die Untersuchung von elektrischen Ladungen in elektrischen und magnetischen Feldern ist ein zentrales Thema der Elektrodynamik. Sie erklärt grundlegende Phänomene und Anwendungen wie Kondensatoren, Elektromotoren und Teilchenbeschleuniger.',
    explanation: `
      <h5>Ladungen im elektrischen Feld</h5>
      <p>Eine elektrische Ladung q erfährt im elektrischen Feld E die Kraft F = q·E. Positive Ladungen werden in Richtung des elektrischen Feldes beschleunigt, negative Ladungen in entgegengesetzter Richtung.</p>
      <p>Elektrische Feldenergie: Wird eine Ladung in einem elektrischen Feld bewegt, ändert sich ihre potentielle Energie. Die Arbeit, die dafür aufgewendet werden muss, ist W = q·(V₂ - V₁), wobei V₁ und V₂ die elektrischen Potentiale an den Anfangs- und Endpunkten sind.</p>
      
      <h5>Ladungen im magnetischen Feld</h5>
      <p>Eine bewegte Ladung q mit der Geschwindigkeit v erfährt im magnetischen Feld B die Lorentzkraft F = q·(v × B). Diese Kraft steht senkrecht zur Bewegungsrichtung und zur Richtung des magnetischen Feldes.</p>
      <p>Bewegung im homogenen Magnetfeld: Eine geladene Teilchen, das sich senkrecht zu einem homogenen Magnetfeld bewegt, wird auf eine Kreisbahn gezwungen. Der Radius dieser Bahn ist r = (m·v)/(|q|·B), wobei m die Masse des Teilchens ist.</p>
      
      <h5>Ladungen in kombinieren Feldern</h5>
      <p>In der Praxis sind oft elektrische und magnetische Felder gleichzeitig vorhanden. Die Gesamtkraft auf eine Ladung ist dann durch die vollständige Lorentzkraft gegeben: F = q·(E + v × B).</p>
      <p>Ein wichtiges Anwendungsbeispiel ist der Wien-Filter, der geladene Teilchen nach dem Verhältnis von Ladung zu Masse sortiert.</p>
      
      <h5>Bewegungsgleichungen</h5>
      <p>Die Bewegung geladener Teilchen in elektromagnetischen Feldern wird durch Differentialgleichungen beschrieben, die aus dem zweiten Newtonschen Gesetz und der Lorentzkraft abgeleitet werden: m·a = q·(E + v × B).</p>
      <p>Diese Gleichungen bilden die Grundlage für die Berechnung von Teilchenbahnen in Beschleunigern, Massenspektrometern und anderen Geräten der modernen Physik.</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Elektronenstrahl im elektrischen Feld</h6>
        <p>Ein Elektronenstrahl mit der Geschwindigkeit v = 10⁷ m/s tritt in ein homogenes elektrisches Feld mit E = 10⁴ V/m ein, das senkrecht zur Bewegungsrichtung verläuft. Die Elektronen werden nach der Gleichung y = (q·E)/(2·m)·t² abgelenkt, wobei t die Zeit ist.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Zyklotronbewegung</h6>
        <p>Ein Proton bewegt sich mit v = 5·10⁶ m/s senkrecht zu einem Magnetfeld mit B = 1,5 T. Der Radius der Kreisbahn beträgt r = (m·v)/(q·B) = (1,67·10⁻²⁷ kg · 5·10⁶ m/s)/(1,6·10⁻¹⁹ C · 1,5 T) ≈ 0,035 m = 3,5 cm.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Halleffekt</h6>
        <p>Fließt ein Strom durch einen Leiter, der sich in einem Magnetfeld befindet, werden die Ladungsträger durch die Lorentzkraft abgelenkt. Dadurch entsteht eine Spannung senkrecht zur Stromrichtung (Hall-Spannung), die zur Messung von Magnetfeldern genutzt werden kann.</p>
      </div>
    `,
    relatedFormulas: ['lorentz-force', 'electric-field-strength'],
    relatedTopics: ['elektrische-feld', 'magnetische-feld', 'elektromagnetische-induktion']
  },
  
  // Basierend auf dem Bild: 5. Elektromagnetische Induktion
  {
    id: 'elektromagnetische-induktion',
    name: 'Elektromagnetische Induktion',
    category: 'electricity',
    shortDescription: 'Die elektromagnetische Induktion beschreibt die Erzeugung einer elektrischen Spannung durch ein sich änderndes Magnetfeld.',
    introduction: 'Die elektromagnetische Induktion, entdeckt von Michael Faraday im Jahr 1831, ist ein fundamentales Prinzip der Elektrodynamik. Sie bildet die Grundlage für Generatoren, Transformatoren und viele andere elektrische Geräte in unserem Alltag.',
    explanation: `
      <h5>Faradaysches Induktionsgesetz</h5>
      <p>Das Faradaysche Induktionsgesetz besagt, dass eine elektrische Spannung in einem Leiter induziert wird, wenn sich der magnetische Fluss durch die vom Leiter umschlossene Fläche ändert.</p>
      <p>Die induzierte Spannung ist proportional zur Änderungsrate des magnetischen Flusses: U_ind = -dΦ/dt</p>
      <p>Dabei ist Φ = B·A·cos(α) der magnetische Fluss, mit B als magnetische Flussdichte, A als Fläche und α als Winkel zwischen der Flächennormalen und der Richtung des Magnetfelds.</p>
      
      <h5>Lenzsche Regel</h5>
      <p>Die Lenzsche Regel ergänzt das Induktionsgesetz und besagt, dass der induzierte Strom immer so gerichtet ist, dass er der Ursache seiner Entstehung entgegenwirkt. Dies erklärt das negative Vorzeichen im Induktionsgesetz.</p>
      <p>Wird beispielsweise ein Magnet in eine Spule hineinbewegt, entsteht ein induzierter Strom, der ein Magnetfeld erzeugt, das dem Hineinbewegen des Magneten entgegenwirkt.</p>
      
      <h5>Induktionsmethoden</h5>
      <p>Es gibt verschiedene Methoden, um eine Spannung zu induzieren:</p>
      <ul>
        <li>Bewegungsinduktion: Ein Leiter bewegt sich durch ein stationäres Magnetfeld</li>
        <li>Transformatorinduktion: Ein sich zeitlich änderndes Magnetfeld induziert eine Spannung in einem stationären Leiter</li>
        <li>Selbstinduktion: Ein sich ändernder Strom in einer Spule induziert eine Spannung in derselben Spule</li>
      </ul>
      
      <h5>Anwendungen</h5>
      <p>Die elektromagnetische Induktion hat zahlreiche praktische Anwendungen:</p>
      <ul>
        <li>Generatoren zur Stromerzeugung</li>
        <li>Transformatoren zur Spannungstransformation</li>
        <li>Induktionsherde</li>
        <li>Elektromotoren (als Umkehrung des Generatorprinzips)</li>
        <li>Induktive Sensoren</li>
      </ul>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Generator</h6>
        <p>Eine Spule mit 500 Windungen und einer Fläche von 0,01 m² rotiert mit einer Frequenz von 50 Hz in einem homogenen Magnetfeld mit B = 0,5 T. Die maximale induzierte Spannung beträgt U_max = N·B·A·2π·f = 500 · 0,5 T · 0,01 m² · 2π · 50 Hz ≈ 785 V.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Transformator</h6>
        <p>Ein Transformator hat eine Primärspule mit 1000 Windungen und eine Sekundärspule mit 100 Windungen. Wird an der Primärseite eine Spannung von 230 V angelegt, beträgt die Sekundärspannung U_sek = U_prim · (N_sek / N_prim) = 230 V · (100 / 1000) = 23 V.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Induktiver Sensor</h6>
        <p>Induktive Sensoren nutzen das Prinzip der elektromagnetischen Induktion, um die Anwesenheit von metallischen Objekten zu detektieren. Nähert sich ein Metall dem Sensor, ändert sich die Induktivität einer Spule, was als Signal erfasst werden kann.</p>
      </div>
    `,
    relatedFormulas: ['faraday-law', 'magnetic-flux'],
    relatedTopics: ['elektrische-feld', 'magnetische-feld', 'schwingungen']
  },
  
  // Basierend auf dem Bild: 6. Schwingungen
  {
    id: 'schwingungen',
    name: 'Schwingungen',
    category: 'mechanics',
    shortDescription: 'Schwingungen sind periodische Bewegungen um eine Gleichgewichtslage, die in vielen Bereichen der Physik eine zentrale Rolle spielen.',
    introduction: 'Schwingungen sind allgegenwärtig in der Natur und Technik - von der Bewegung eines Pendels über Schallwellen bis hin zu elektromagnetischen Wellen. Das Verständnis von Schwingungsphänomenen bildet eine Grundlage für viele Bereiche der Physik.',
    explanation: `
      <h5>Grundbegriffe der Schwingungslehre</h5>
      <p>Eine Schwingung ist eine zeitlich periodische Bewegung eines Systems um eine Gleichgewichtslage. Wichtige Größen sind:</p>
      <ul>
        <li>Amplitude A: Maximale Auslenkung aus der Ruhelage</li>
        <li>Frequenz f: Anzahl der Schwingungen pro Zeiteinheit (in Hz = 1/s)</li>
        <li>Periode T: Dauer einer vollständigen Schwingung (T = 1/f)</li>
        <li>Kreisfrequenz ω: ω = 2π·f = 2π/T</li>
        <li>Phase φ: Momentane Position im Schwingungszyklus</li>
      </ul>
      
      <h5>Harmonische Schwingung</h5>
      <p>Die einfachste Form der Schwingung ist die harmonische Schwingung, die durch eine Sinusfunktion beschrieben wird:</p>
      <p>x(t) = A·sin(ω·t + φ₀)</p>
      <p>Bei einer harmonischen Schwingung ist die rücktreibende Kraft proportional zur Auslenkung (Hooksches Gesetz): F = -k·x</p>
      <p>Die Differentialgleichung der harmonischen Schwingung lautet: ẍ + ω²·x = 0, mit ω² = k/m für eine Federschwingung.</p>
      
      <h5>Gedämpfte Schwingungen</h5>
      <p>In realen Systemen tritt oft eine Dämpfung auf, die die Amplitude mit der Zeit abnehmen lässt. Die Bewegungsgleichung einer gedämpften Schwingung ist:</p>
      <p>ẍ + 2δ·ẋ + ω₀²·x = 0</p>
      <p>Dabei ist δ der Dämpfungskoeffizient und ω₀ die Eigenkreisfrequenz des ungedämpften Systems.</p>
      
      <h5>Erzwungene Schwingungen und Resonanz</h5>
      <p>Wird ein schwingungsfähiges System durch eine externe periodische Kraft angeregt, spricht man von erzwungenen Schwingungen. Die Differentialgleichung lautet:</p>
      <p>ẍ + 2δ·ẋ + ω₀²·x = F₀/m·cos(ω·t)</p>
      <p>Resonanz tritt auf, wenn die Anregungsfrequenz ω nahe der Eigenfrequenz ω₀ des Systems liegt. In diesem Fall kann die Amplitude sehr groß werden.</p>
      
      <h5>Gekoppelte Schwingungen</h5>
      <p>Wenn zwei oder mehr schwingungsfähige Systeme miteinander verbunden sind, können sie Energie austauschen und komplexe Schwingungsmuster zeigen. Diese gekoppelten Schwingungen sind wichtig für das Verständnis vieler physikalischer Phänomene, von Molekülschwingungen bis hin zu elektrischen Schaltkreisen.</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Federpendel</h6>
        <p>Ein Körper der Masse 0,5 kg ist an einer Feder mit der Federkonstante 20 N/m befestigt. Die Frequenz der harmonischen Schwingung beträgt f = (1/2π)·√(k/m) = (1/2π)·√(20 N/m / 0,5 kg) ≈ 1 Hz.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Mathematisches Pendel</h6>
        <p>Für kleine Auslenkungen schwingt ein mathematisches Pendel der Länge 1 m harmonisch mit der Frequenz f = (1/2π)·√(g/l) = (1/2π)·√(9,81 m/s² / 1 m) ≈ 0,5 Hz.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Resonanzkatastrophe</h6>
        <p>Die Tacoma-Narrows-Brücke, die 1940 einstürzte, ist ein berühmtes Beispiel für Resonanz. Windstöße regten die Brücke mit einer Frequenz nahe ihrer Eigenfrequenz an, was zu immer größeren Schwingungsamplituden und schließlich zum Einsturz führte.</p>
      </div>
    `,
    relatedFormulas: ['harmonic-oscillation', 'pendulum-period'],
    relatedTopics: ['elektromagnetische-induktion', 'wellen', 'resonanz']
  },
  
  {
    id: 'newton',
    name: 'Newtonsche Gesetze',
    category: 'mechanics',
    shortDescription: 'Die drei Newtonschen Gesetze bilden die Grundlage der klassischen Mechanik und beschreiben die Bewegung von Körpern unter dem Einfluss von Kräften.',
    introduction: 'Die Newtonschen Gesetze, benannt nach Sir Isaac Newton, bilden das Fundament der klassischen Mechanik. Sie beschreiben, wie Körper auf Kräfte reagieren und miteinander interagieren.',
    explanation: `
      <h5>1. Newtonsches Gesetz (Trägheitsgesetz)</h5>
      <p>Ein Körper verharrt im Zustand der Ruhe oder der gleichförmigen Bewegung, solange keine Kraft auf ihn einwirkt, die diesen Zustand ändert.</p>
      <p>Mathematisch ausgedrückt: Wenn die Summe aller Kräfte gleich Null ist (ΣF = 0), dann ist die Beschleunigung auch Null (a = 0).</p>
      
      <h5>2. Newtonsches Gesetz (Kraftgesetz)</h5>
      <p>Die Änderung der Bewegung ist der Einwirkung der bewegenden Kraft proportional und erfolgt in Richtung derjenigen geraden Linie, in welcher jene Kraft wirkt.</p>
      <p>Mathematisch ausgedrückt: F = m·a, wobei F die Kraft, m die Masse und a die Beschleunigung ist.</p>
      
      <h5>3. Newtonsches Gesetz (Wechselwirkungsgesetz)</h5>
      <p>Kräfte treten immer paarweise auf. Übt ein Körper A auf einen anderen Körper B eine Kraft aus (Actio), so wirkt eine gleich große, aber entgegengerichtete Kraft von Körper B auf Körper A (Reactio).</p>
      <p>Mathematisch ausgedrückt: F_AB = -F_BA</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel zum 1. Newtonschen Gesetz:</h6>
        <p>Ein Ball, der auf einer reibungsfreien Oberfläche rollt, würde ohne Einwirkung externer Kräfte für immer mit konstanter Geschwindigkeit weiterrollen.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel zum 2. Newtonschen Gesetz:</h6>
        <p>Wenn eine Kraft von 20 N auf einen Körper mit einer Masse von 4 kg wirkt, erfährt dieser eine Beschleunigung von a = F/m = 20 N / 4 kg = 5 m/s².</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel zum 3. Newtonschen Gesetz:</h6>
        <p>Wenn du gegen eine Wand drückst, drückt die Wand mit der gleichen Kraft zurück. Deshalb spürst du einen Widerstand.</p>
      </div>
    `,
    relatedFormulas: ['newton-second-law', 'momentum'],
    relatedTopics: ['momentum-conservation', 'frictionless-motion']
  },
  {
    id: 'ohm',
    name: 'Ohmsches Gesetz',
    category: 'electricity',
    shortDescription: 'Das Ohmsche Gesetz beschreibt den Zusammenhang zwischen elektrischer Spannung, Stromstärke und Widerstand in einem elektrischen Stromkreis.',
    introduction: 'Das Ohmsche Gesetz, benannt nach dem deutschen Physiker Georg Simon Ohm, beschreibt eine der grundlegendsten Beziehungen in der Elektrizitätslehre und ist essentiell für das Verständnis elektrischer Schaltkreise.',
    explanation: `
      <p>Das Ohmsche Gesetz besagt, dass die Stromstärke I durch einen elektrischen Leiter direkt proportional zur angelegten Spannung U und umgekehrt proportional zum elektrischen Widerstand R ist.</p>
      
      <p>Mathematisch wird dies durch die Formel U = R·I ausgedrückt. Diese kann auch umgestellt werden zu:</p>
      <ul>
        <li>I = U/R (Stromstärke)</li>
        <li>R = U/I (Widerstand)</li>
      </ul>
      
      <p>Der elektrische Widerstand R ist eine Materialeigenschaft und wird in der Einheit Ohm (Ω) gemessen. Er beschreibt, wie stark ein Material dem Fluss elektrischer Ladung entgegenwirkt.</p>
      
      <p>Das Ohmsche Gesetz gilt allerdings nur für bestimmte Materialien, sogenannte "Ohmsche Leiter" (wie die meisten Metalle bei konstanter Temperatur). Bei anderen Materialien oder unter bestimmten Bedingungen (z.B. bei Halbleitern oder bei sehr hohen Spannungen) kann die Beziehung zwischen Strom und Spannung nichtlinear sein.</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 1: Berechnung der Stromstärke</h6>
        <p>An einem Widerstand von 220 Ω liegt eine Spannung von 11 V an. Wie groß ist die Stromstärke?</p>
        <p>Lösung: I = U/R = 11 V / 220 Ω = 0,05 A = 50 mA</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel 2: Berechnung des Widerstands</h6>
        <p>Durch einen elektrischen Leiter fließt bei einer Spannung von 230 V ein Strom von 2 A. Wie groß ist der Widerstand des Leiters?</p>
        <p>Lösung: R = U/I = 230 V / 2 A = 115 Ω</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel 3: Berechnung der Spannung</h6>
        <p>Ein Stromkreis enthält einen Widerstand von 1000 Ω und es fließt ein Strom von 0,5 A. Welche Spannung liegt an?</p>
        <p>Lösung: U = R·I = 1000 Ω · 0,5 A = 500 V</p>
      </div>
    `,
    relatedFormulas: ['ohms-law', 'electrical-power'],
    relatedTopics: ['electrical-circuits', 'resistors-in-series-parallel']
  },
  {
    id: 'thermo',
    name: 'Thermodynamische Hauptsätze',
    category: 'thermodynamics',
    shortDescription: 'Die Hauptsätze der Thermodynamik beschreiben die grundlegenden Prinzipien der Wärmelehre und definieren die Begriffe Energie, Entropie und Temperatur.',
    introduction: 'Die Thermodynamik ist ein Teilgebiet der Physik, das sich mit Energie, Wärme und ihrer Umwandlung beschäftigt. Die thermodynamischen Hauptsätze sind fundamentale Naturgesetze, die grundlegende Prinzipien der Energieerhaltung und -umwandlung festlegen.',
    explanation: `
      <h5>0. Hauptsatz (Thermisches Gleichgewicht)</h5>
      <p>Wenn zwei Systeme jeweils im thermischen Gleichgewicht mit einem dritten System stehen, dann stehen sie auch untereinander im thermischen Gleichgewicht.</p>
      <p>Dieser Satz führt zum Begriff der Temperatur: Zwei Körper haben genau dann die gleiche Temperatur, wenn sie im thermischen Gleichgewicht miteinander stehen.</p>
      
      <h5>1. Hauptsatz (Energieerhaltung)</h5>
      <p>Energie kann weder erzeugt noch vernichtet werden – sie kann nur von einer Form in eine andere umgewandelt werden.</p>
      <p>Für ein thermodynamisches System bedeutet dies: Die Änderung der inneren Energie ΔU eines Systems ist gleich der Summe aus zugeführter Wärme Q und verrichteter Arbeit W.</p>
      <p>Mathematisch: ΔU = Q + W</p>
      
      <h5>2. Hauptsatz (Entropie und Irreversibilität)</h5>
      <p>Wärme fließt nicht von selbst von einem kälteren zu einem wärmeren Körper. Die Entropie S eines abgeschlossenen Systems nimmt bei irreversiblen Prozessen zu und bleibt bei reversiblen Prozessen konstant.</p>
      <p>Dies bedeutet auch: Kein Prozess ist möglich, dessen einziges Ergebnis die vollständige Umwandlung von Wärme in Arbeit ist (Unmöglichkeit eines Perpetuum mobile zweiter Art).</p>
      
      <h5>3. Hauptsatz (Unerreichbarkeit des absoluten Nullpunkts)</h5>
      <p>Der absolute Nullpunkt der Temperatur (0 Kelvin oder -273,15°C) kann durch keinen physikalischen Prozess vollständig erreicht werden.</p>
    `,
    examples: `
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel zum 1. Hauptsatz:</h6>
        <p>Wenn ein Gas in einem Zylinder komprimiert wird, steigt seine Temperatur, weil mechanische Arbeit in innere Energie (Wärme) umgewandelt wird.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded mb-3">
        <h6>Beispiel zum 2. Hauptsatz:</h6>
        <p>Ein Eiswürfel in einem Glas Wasser schmilzt und kühlt das Wasser ab, bis ein Temperaturausgleich erreicht ist. Der umgekehrte Prozess - dass sich spontan aus lauwarmen Wasser ein Eiswürfel bildet und das restliche Wasser wärmer wird - ist nach dem 2. Hauptsatz unmöglich.</p>
      </div>
      
      <div class="example-box p-3 bg-light rounded">
        <h6>Beispiel zum 3. Hauptsatz:</h6>
        <p>Mit modernen Kühltechniken können Temperaturen bis zu wenigen Mikro- oder sogar Nanokelvin erreicht werden, aber nie exakt 0 Kelvin.</p>
      </div>
    `,
    relatedFormulas: ['entropy-change', 'heat-transfer'],
    relatedTopics: ['heat-engines', 'entropy', 'thermal-energy']
  }
];

// API Endpoints
app.get('/api/formulas', (req, res) => {
  res.json(formulas);
});

app.get('/api/formulas/:id', (req, res) => {
  const formula = formulas.find(f => f.id === req.params.id);
  if (formula) {
    res.json(formula);
  } else {
    res.status(404).json({ error: 'Formel nicht gefunden' });
  }
});

app.get('/api/topics', (req, res) => {
  res.json(topics);
});

app.get('/api/topics/:id', (req, res) => {
  const topic = topics.find(t => t.id === req.params.id);
  if (topic) {
    res.json(topic);
  } else {
    res.status(404).json({ error: 'Thema nicht gefunden' });
  }
});

app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    return res.status(400).json({ error: 'Suchbegriff erforderlich' });
  }
  
  const results = {
    formulas: formulas.filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.explanation.toLowerCase().includes(query)
    ),
    topics: topics.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.shortDescription.toLowerCase().includes(query) || 
      t.introduction.toLowerCase().includes(query)
    )
  };
  
  res.json(results);
});

// Serve main page
// Forum Data
const forumTopics = [
  {
    id: 1,
    title: 'Gravitationskraft und Fallbeschleunigung',
    category: 'basic',
    author: 'PhysikFan',
    date: '2025-03-15',
    content: 'Ich verstehe den Unterschied zwischen Gravitationskraft und Fallbeschleunigung nicht ganz. Kann jemand das erklären?',
    replies: [
      {
        author: 'PhysikLehrer',
        date: '2025-03-16',
        content: 'Die Gravitationskraft ist die Kraft, mit der zwei Massen sich gegenseitig anziehen (F = G * (m1*m2)/r²). Die Fallbeschleunigung (g ≈ 9,81 m/s²) hingegen ist die Beschleunigung, die ein Körper aufgrund dieser Kraft erfährt, wenn er im Gravitationsfeld fällt. Nach Newtons zweitem Gesetz gilt: F = m * a, wobei F die Gravitationskraft, m die Masse des Körpers und a die Beschleunigung ist.'
      }
    ]
  },
  {
    id: 2,
    title: 'Relativitätstheorie - Zeitdilatation verständlich erklärt',
    category: 'advanced',
    author: 'EinsteinFan',
    date: '2025-03-14',
    content: 'Ich suche nach einer verständlichen Erklärung der Zeitdilatation in der speziellen Relativitätstheorie. Hat jemand gute Ressourcen oder Erklärungen?',
    replies: []
  },
  {
    id: 3,
    title: 'Hebelgesetz - Anwendungsbeispiele',
    category: 'basic',
    author: 'MechanikerIn',
    date: '2025-03-18',
    content: 'Welche alltäglichen Beispiele gibt es für das Hebelgesetz? Ich suche nach praktischen Anwendungen, die ich im Unterricht vorstellen kann.',
    replies: [
      {
        author: 'PhysikProf',
        date: '2025-03-18',
        content: 'Klassische Beispiele sind Schere, Nussknacker, Wippe, Flaschenöffner oder Brechstange. Auch ein Kugelschreiber, den man drückt, nutzt das Hebelgesetz!'
      },
      {
        author: 'HobbyTüftler',
        date: '2025-03-19',
        content: 'Vergiss nicht den menschlichen Körper! Unsere Muskeln und Knochen bilden Hebelsysteme. Ein einfaches Beispiel ist das Heben eines Gewichts mit dem Unterarm.'
      }
    ]
  },
  {
    id: 4,
    title: 'Quantenverschränkung - Frage zum EPR-Paradoxon',
    category: 'advanced',
    author: 'QuantenForscher',
    date: '2025-03-17',
    content: 'Wie lässt sich das EPR-Paradoxon in Bezug auf die Quantenverschränkung am besten verstehen? Ich habe Schwierigkeiten, die Nicht-Lokalität zu interpretieren.',
    replies: []
  }
];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/forum', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forum.html'));
});

// API Endpoints for Forum
app.get('/api/forum/topics', (req, res) => {
  res.json(forumTopics);
});

app.get('/api/forum/topics/:id', (req, res) => {
  const topicId = parseInt(req.params.id);
  const topic = forumTopics.find(t => t.id === topicId);
  
  if (!topic) {
    return res.status(404).json({ message: 'Topic not found' });
  }
  
  res.json(topic);
});

app.post('/api/forum/topics', (req, res) => {
  const { title, category, author, content } = req.body;
  
  if (!title || !category || !author || !content) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const newTopic = {
    id: forumTopics.length > 0 ? Math.max(...forumTopics.map(t => t.id)) + 1 : 1,
    title,
    category,
    author,
    date: new Date().toISOString().split('T')[0],
    content,
    replies: []
  };
  
  forumTopics.push(newTopic);
  res.status(201).json(newTopic);
});

app.post('/api/forum/topics/:id/replies', (req, res) => {
  const topicId = parseInt(req.params.id);
  const { author, content } = req.body;
  
  if (!author || !content) {
    return res.status(400).json({ message: 'Author and content are required' });
  }
  
  const topicIndex = forumTopics.findIndex(t => t.id === topicId);
  
  if (topicIndex === -1) {
    return res.status(404).json({ message: 'Topic not found' });
  }
  
  const newReply = {
    author,
    date: new Date().toISOString().split('T')[0],
    content
  };
  
  forumTopics[topicIndex].replies.push(newReply);
  res.status(201).json(newReply);
});

// In-memory storage for users and favorites
const users = [];
const favorites = {};

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Nicht angemeldet' });
};

// User registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  
  // Validate input
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Alle Felder müssen ausgefüllt werden' });
  }
  
  // Check if username already exists
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: 'Benutzername ist bereits vergeben' });
  }
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      email
    };
    
    // Add user to memory storage
    users.push(newUser);
    
    // Initialize favorites storage for user
    favorites[newUser.id] = [];
    
    res.status(201).json({ message: 'Registrierung erfolgreich', userId: newUser.id });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Serverfehler bei der Registrierung' });
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(user => user.username === username);
  
  if (!user) {
    return res.status(401).json({ message: 'Ungültiger Benutzername oder Passwort' });
  }
  
  try {
    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Ungültiger Benutzername oder Passwort' });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    
    res.json({ 
      message: 'Anmeldung erfolgreich',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Serverfehler bei der Anmeldung' });
  }
});

// User logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Fehler beim Abmelden' });
    }
    res.json({ message: 'Erfolgreich abgemeldet' });
  });
});

// Get current user info
app.get('/api/user', isAuthenticated, (req, res) => {
  const user = users.find(user => user.id === req.session.userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Benutzer nicht gefunden' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    email: user.email
  });
});

// Check if user is logged in
app.get('/api/auth/status', (req, res) => {
  if (req.session.userId) {
    res.json({ 
      isLoggedIn: true,
      username: req.session.username
    });
  } else {
    res.json({ isLoggedIn: false });
  }
});

// Add formula to favorites
app.post('/api/favorites/formulas', isAuthenticated, (req, res) => {
  const { formulaId } = req.body;
  const userId = req.session.userId;
  
  // Validate formula existence
  const formula = formulas.find(f => f.id === formulaId);
  if (!formula) {
    return res.status(404).json({ message: 'Formel nicht gefunden' });
  }
  
  // Check if formula already in favorites
  if (favorites[userId].includes(formulaId)) {
    return res.status(400).json({ message: 'Formel ist bereits in Favoriten' });
  }
  
  // Add to favorites
  favorites[userId].push(formulaId);
  
  res.status(200).json({ message: 'Formel zu Favoriten hinzugefügt' });
});

// Remove formula from favorites
app.delete('/api/favorites/formulas/:id', isAuthenticated, (req, res) => {
  const formulaId = req.params.id;
  const userId = req.session.userId;
  
  // Check if formula in favorites
  const index = favorites[userId].indexOf(formulaId);
  if (index === -1) {
    return res.status(404).json({ message: 'Formel nicht in Favoriten gefunden' });
  }
  
  // Remove from favorites
  favorites[userId].splice(index, 1);
  
  res.status(200).json({ message: 'Formel aus Favoriten entfernt' });
});

// Get user's favorite formulas
app.get('/api/favorites/formulas', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  
  // Get list of favorite formula IDs
  const favoriteIds = favorites[userId] || [];
  
  // Get full formula objects
  const favoriteFormulas = formulas.filter(formula => favoriteIds.includes(formula.id));
  
  res.json(favoriteFormulas);
});

// For any other routes, serve the index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});