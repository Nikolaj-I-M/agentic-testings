const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error("The application mount point is missing.");
}

app.innerHTML = `
  <h1>McSquishy: Blob on the Run</h1>
  <p>The game scaffold is ready.</p>
`;
