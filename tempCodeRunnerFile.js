
app.use('/',require('./route'));

app.listen(3000, () => {
  console.log('Server is listening on http://localhost:3000');
});

