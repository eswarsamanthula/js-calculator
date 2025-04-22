// DOM Elements
const display = document.getElementById('display');
const historyList = document.getElementById('historyList');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const scientificToggle = document.getElementById('scientificToggle');
const scientificButtons = document.getElementById('scientificButtons');

// Calculator variables
let currentInput = '';
let calculationHistory = [];
let lastResult = null;
let maxHistoryItems = 10; // Default history limit

// Load saved data
function loadSavedData() {
  // Load dark mode preference
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  modeToggle.checked = isDarkMode;
  updateTheme(isDarkMode);
  
  // Load scientific mode preference
  const isScientific = localStorage.getItem('scientificMode') === 'true';
  scientificToggle.checked = isScientific;
  toggleScientificMode(isScientific);
  
  // Load history limit preference
  const savedHistoryLimit = localStorage.getItem('historyLimit');
  if (savedHistoryLimit) {
    maxHistoryItems = parseInt(savedHistoryLimit);
  }
  
  // Load calculation history
  const savedHistory = localStorage.getItem('calculationHistory');
  if (savedHistory) {
    calculationHistory = JSON.parse(savedHistory);
    updateHistoryDisplay();
  }
}

// Handle dark/light mode toggle
function updateTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    modeLabel.textContent = 'Light Mode';
  } else {
    document.body.classList.remove('dark-mode');
    modeLabel.textContent = 'Dark Mode';
  }
  localStorage.setItem('darkMode', isDark);
}

modeToggle.addEventListener('change', function() {
  updateTheme(this.checked);
});

// Handle scientific mode toggle
function toggleScientificMode(isScientific) {
  scientificButtons.style.display = isScientific ? 'grid' : 'none';
  localStorage.setItem('scientificMode', isScientific);
}

scientificToggle.addEventListener('change', function() {
  toggleScientificMode(this.checked);
});

// Basic calculator functions
function appendNumber(number) {
  if (currentInput === '0' && number !== '.') {
    currentInput = number;
  } else {
    currentInput += number;
  }
  display.textContent = currentInput;
}

function appendOperator(operator) {
  const lastChar = currentInput.slice(-1);
  if (['+', '-', '*', '/', '%', '^'].includes(lastChar)) {
    currentInput = currentInput.slice(0, -1) + operator;
  } else {
    currentInput += operator;
  }
  display.textContent = currentInput;
}

function clearDisplay() {
  currentInput = '';
  display.textContent = '0';
}

function backspace() {
  if (currentInput.length > 0) {
    currentInput = currentInput.slice(0, -1);
    display.textContent = currentInput || '0';
  }
}

function calculate() {
  if (!currentInput) return;
  
  try {
    // Save the original expression for history
    const expression = currentInput;
    
    // Prepare input for math.js (replace ^ with ** for exponentiation)
    const processedInput = currentInput.replace(/\^/g, '**');
    
    // Safely evaluate using math.js instead of eval()
    const result = math.evaluate(processedInput).toString();
    
    // Update display and currentInput
    display.textContent = result;
    currentInput = result;
    lastResult = result;
    
    // Add to history
    addToHistory(expression, result);
  } catch (e) {
    display.textContent = 'Error';
    currentInput = '';
    console.error('Calculation error:', e);
  }
}

// Scientific calculator functions
function calculateFunction(func) {
  if (!currentInput && func !== 'pi') return;

  try {
    const number = parseFloat(currentInput);
    let result;
    let expression = '';

    switch (func) {
      case 'sqrt':
        result = math.sqrt(number);
        expression = `√(${currentInput})`;
        break;
      case 'square':
        result = math.pow(number, 2);
        expression = `(${currentInput})²`;
        break;
      case 'cube':
        result = math.pow(number, 3);
        expression = `(${currentInput})³`;
        break;
      case '1/x':
        result = 1 / number;
        expression = `1/(${currentInput})`;
        break;
      case 'sin':
        result = math.sin(number);
        expression = `sin(${currentInput})`;
        break;
      case 'cos':
        result = math.cos(number);
        expression = `cos(${currentInput})`;
        break;
      case 'tan':
        result = math.tan(number);
        expression = `tan(${currentInput})`;
        break;
      case 'log':
        result = math.log10(number);
        expression = `log(${currentInput})`;
        break;
      case 'ln':
        result = math.log(number);
        expression = `ln(${currentInput})`;
        break;
    }

    // Add to history and update display
    display.textContent = result;
    addToHistory(expression, result);
    currentInput = result.toString();
    lastResult = result;
  } catch (e) {
    display.textContent = 'Error';
    currentInput = '';
    console.error('Scientific function error:', e);
  }
}

// History functions
function addToHistory(expression, result) {
  calculationHistory.unshift({ expression, result });
  if (calculationHistory.length > maxHistoryItems) {
    calculationHistory.pop();
  }
  updateHistoryDisplay();
  saveHistory();
}

function updateHistoryDisplay() {
  historyList.innerHTML = '';
  calculationHistory.forEach((item) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-expression">${item.expression}</div>
      <div class="history-result">${item.result}</div>
    `;
    historyItem.addEventListener('click', () => {
      currentInput = item.result;
      display.textContent = currentInput;
    });
    historyList.appendChild(historyItem);
  });
}

function clearHistory() {
  calculationHistory = [];
  updateHistoryDisplay();
  saveHistory();
}

function saveHistory() {
  localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
}

// History import/export functions
function exportHistory() {
  const dataStr = JSON.stringify(calculationHistory);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'calculator-history.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function importHistory(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedHistory = JSON.parse(e.target.result);
      if (Array.isArray(importedHistory)) {
        calculationHistory = importedHistory.concat(calculationHistory);
        // Limit to max history items
        if (calculationHistory.length > maxHistoryItems) {
          calculationHistory = calculationHistory.slice(0, maxHistoryItems);
        }
        updateHistoryDisplay();
        saveHistory();
        alert('History imported successfully!');
      } else {
        alert('Invalid history format.');
      }
    } catch (error) {
      alert('Error importing history: ' + error.message);
    }
  };
  reader.readAsText(file);
}

// Set history limit
function setHistoryLimit(limit) {
  maxHistoryItems = limit;
  localStorage.setItem('historyLimit', limit);
  
  // Trim existing history if needed
  if (calculationHistory.length > maxHistoryItems) {
    calculationHistory = calculationHistory.slice(0, maxHistoryItems);
    updateHistoryDisplay();
    saveHistory();
  }
}

// Keyboard support
document.addEventListener('keydown', function(event) {
  const key = event.key;
  
  // Number keys
  if (/[0-9.]/.test(key)) {
    appendNumber(key);
  }
  // Operators
  else if (['+', '-', '*', '/'].includes(key)) {
    appendOperator(key);
  }
  // Equal sign and Enter key
  else if (key === '=' || key === 'Enter') {
    calculate();
    event.preventDefault(); // Prevent form submission if in a form
  }
  // Backspace
  else if (key === 'Backspace') {
    backspace();
  }
  // Escape key for clear
  else if (key === 'Escape') {
    clearDisplay();
  }
  // Percentage
  else if (key === '%') {
    appendOperator('%');
  }
  // Power
  else if (key === '^') {
    appendOperator('^');
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadSavedData();
});