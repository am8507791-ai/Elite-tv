import http from 'https';
http.get('https://i.ibb.co/S800S80/Remove-background-project.png', (res) => {
  console.log(res.statusCode, res.headers['content-type']);
});
