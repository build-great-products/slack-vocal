export const styles = `
  body {
    font-family: Arial, sans-serif;
    margin: 20px;
  }
  .container {
    max-width: 1000px;
    margin: 0 auto;
  }
  h1 {
    text-align: center;
    color: #1a1a1a;
  }
  .chart-container {
    height: 500px;
    margin-top: 20px;
    width: 100%;
  }
  .time-selector {
    display: flex;
    justify-content: center;
    margin: 20px 0;
    gap: 10px;
  }
  .time-button {
    padding: 8px 16px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
  }
  .time-button:hover {
    background-color: #e0e0e0;
  }
  .time-button.active {
    background-color: #4a90e2;
    color: white;
    border-color: #3a80d2;
  }
`;
