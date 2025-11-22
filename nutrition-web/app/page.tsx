const res = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    age,
    gender,
    height,
    weight,
    activityLevel,
  }),
});

const json = await res.json();
console.log('RESPONSE FROM /api/users:', json);

if (!res.ok || !json.ok) {
  // показать красную надпись
} else {
  // скрыть надпись
}
