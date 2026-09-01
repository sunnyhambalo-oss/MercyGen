const API_BASE = window.location.origin;

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('login-error');

  try {
    errorElement.textContent = '';
    errorElement.classList.remove('show');

    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    window.location.assign('/admin');
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.classList.add('show');
  }
});
