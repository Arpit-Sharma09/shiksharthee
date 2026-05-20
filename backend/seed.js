async function seed() {
  try {
    console.log('Seeding student...');
    await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student'
      })
    });

    console.log('Seeding instructor...');
    await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Instructor',
        email: 'instructor@test.com',
        password: 'password123',
        role: 'instructor'
      })
    });

    console.log('Seeding admin...');
    await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      })
    });

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Error seeding:', err.response?.data || err.message);
  }
}

seed();
