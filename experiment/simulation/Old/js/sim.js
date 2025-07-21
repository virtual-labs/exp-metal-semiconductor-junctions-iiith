// Constants
const q = 1.6e-19; // Charge of an electron (Coulombs)
const k = 1.38e-23; // Boltzmann constant (J/K)

// Function to run the simulation
function runSimulation() {
  // Get input values
  const phiM = parseFloat(document.getElementById("phiM").value); // Metal work function (eV)
  const chi = parseFloat(document.getElementById("chi").value); // Electron affinity (eV)
  const T = parseFloat(document.getElementById("temperature").value); // Temperature (K)

  // Calculate Schottky barrier height
  const phiB = phiM - chi;
  document.getElementById("phiBResult").textContent = phiB.toFixed(2);

  // Calculate saturation current (using Richardson's equation)
  const A = 1e-4; // Contact area (m^2)
  const A_star = 120; // Richardson constant (A/(m^2 K^2))
  const Is = A * A_star * T ** 2 * Math.exp(-phiB * q / (k * T));
  document.getElementById("isResult").textContent = Is.toExponential(2);

  // Plot I-V characteristics
  plotIVCharacteristics(Is, T);
}

// Function to plot I-V characteristics
function plotIVCharacteristics(Is, T) {
  const canvas = document.getElementById("ivPlot");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing

  // Generate voltage and current data
  const voltage = [];
  const current = [];
  for (let V = -1; V <= 1; V += 0.01) {
    voltage.push(V);
    current.push(calculateCurrent(V, Is, T));
  }

  // Find maximum and minimum current for scaling
  const maxCurrent = Math.max(...current);
  const minCurrent = Math.min(...current);

  // Plotting logic
  const padding = 40; // Padding for axes and labels
  const xScale = (canvas.width - 2 * padding) / (voltage[voltage.length - 1] - voltage[0]);
  const yScale = (canvas.height - 2 * padding) / (maxCurrent - minCurrent);

  // Draw axes
  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding); // X-axis
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding); // Y-axis
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // Draw gridlines
  ctx.strokeStyle = "#ddd";
  ctx.beginPath();
  for (let V = -1; V <= 1; V += 0.5) {
    const x = padding + (V - voltage[0]) * xScale;
    ctx.moveTo(x, padding);
    ctx.lineTo(x, canvas.height - padding);
  }
  for (let I = minCurrent; I <= maxCurrent; I += (maxCurrent - minCurrent) / 5) {
    const y = canvas.height - padding - (I - minCurrent) * yScale;
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
  }
  ctx.stroke();

  // Draw I-V curve
  ctx.beginPath();
  ctx.strokeStyle = "#007bff";
  ctx.lineWidth = 2;
  for (let i = 0; i < voltage.length; i++) {
    const x = padding + (voltage[i] - voltage[0]) * xScale;
    const y = canvas.height - padding - (current[i] - minCurrent) * yScale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Add labels
  ctx.fillStyle = "#000";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Voltage (V)", canvas.width / 2, canvas.height - 10);
  ctx.save();
  ctx.translate(10, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("Current (A)", 0, 0);
  ctx.restore();
}

// Function to calculate current for a given voltage
function calculateCurrent(V, Is, T) {
  const n = 1; // Ideality factor
  const Vt = (k * T) / q; // Thermal voltage
  return Is * (Math.exp(V / (n * Vt)) - 1);
}