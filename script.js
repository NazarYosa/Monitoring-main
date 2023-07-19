   // Inisialisasi chart asap
   const ctxAsap = document.getElementById('chartAsap').getContext('2d');
   const chartAsap = new Chart(ctxAsap, {
     type: 'line',
     data: {
       labels: [],
       datasets: [
         {
           label: 'Asap',
           data: [],
           borderColor: 'red',
           fill: false,
         },
       ],
     },
     options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
         x: {
           display: true,
           title: {
             display: true,
           },
         },
         y: {
           display: true,
           title: {
             display: true,
           },
         },
       },
     },
   });

   // Inisialisasi chart air
   const ctxAir = document.getElementById('chartAir').getContext('2d');
   const chartAir = new Chart(ctxAir, {
     type: 'line',
     data: {
       labels: [],
       datasets: [
         {
           label: 'Air',
           data: [],
           borderColor: 'blue',
           fill: false,
         },
       ],
     },
     options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
         x: {
           display: true,
           title: {
             display: true,
           },
         },
         y: {
           display: true,
           title: {
             display: true,
           },
         },
       },
     },
   });

   // Fungsi untuk memformat timestamp menjadi jam:menit:detik
   function formatTimestamp(timestamp) {
     const date = new Date(timestamp);
     const hours = date.getHours().toString().padStart(2, '0');
     const minutes = date.getMinutes().toString().padStart(2, '0');
     const seconds = date.getSeconds().toString().padStart(2, '0');
     return `${hours}:${minutes}:${seconds}`;
   }

   // Fungsi untuk memperbarui waktu secara real-time
   function updateClock() {
     const currentTime = new Date();
     const currentHours = currentTime.getHours().toString().padStart(2, '0');
     const currentMinutes = currentTime.getMinutes().toString().padStart(2, '0');
     const currentSeconds = currentTime.getSeconds().toString().padStart(2, '0');
     const currentTimestamp = `${currentHours}:${currentMinutes}:${currentSeconds}`;

     document.getElementById('largeTimestamp').textContent = currentTimestamp;
   }

   // Fungsi untuk mengambil data dari Thingspeak
   function getData() {
     fetch('https://api.thingspeak.com/channels/2220709/feeds.json?results=10')
       .then((response) => response.json())
       .then((data) => {
         // Memperbarui tampilan dengan data terbaru
         updateUI(data);
       })
       .catch((error) => console.error('Error:', error));
   }

   // Fungsi untuk memperbarui tampilan dengan data terbaru
   function updateUI(data) {
     const asapFeeds = data.feeds.filter((feed) => feed.field1 !== null);
     const airFeeds = data.feeds.filter((feed) => feed.field2 !== null);

     // Menghapus data sebelumnya
     chartAsap.data.labels = [];
     chartAsap.data.datasets[0].data = [];

     chartAir.data.labels = [];
     chartAir.data.datasets[0].data = [];

     // Menambahkan data terbaru ke chart asap
     asapFeeds.forEach((feed) => {
       const formattedTimestamp = formatTimestamp(feed.created_at);

       chartAsap.data.labels.push(formattedTimestamp);
       chartAsap.data.datasets[0].data.push(parseFloat(feed.field1));
     });

     // Menambahkan data terbaru ke chart air
     airFeeds.forEach((feed) => {
       const formattedTimestamp = formatTimestamp(feed.created_at);

       chartAir.data.labels.push(formattedTimestamp);
       chartAir.data.datasets[0].data.push(parseFloat(feed.field2));
     });

     // Memperbarui chart sesuai data yang diperbarui
     chartAsap.update();
     chartAir.update();

     // Memperbarui waktu terbaru pada setiap chart
     if (asapFeeds.length > 0) {
       const latestAsapTimestamp =
         asapFeeds[asapFeeds.length - 1].created_at;
       const formattedLatestAsapTimestamp = formatTimestamp(
         latestAsapTimestamp
       );

       document.getElementById(
         'chartAsapTimestamp'
       ).textContent = `Update: ${formattedLatestAsapTimestamp}`;
     }

     if (airFeeds.length > 0) {
       const latestAirTimestamp = airFeeds[airFeeds.length - 1].created_at;
       const formattedLatestAirTimestamp = formatTimestamp(
         latestAirTimestamp
       );

       document.getElementById(
         'chartAirTimestamp'
       ).textContent = `Update: ${formattedLatestAirTimestamp}`;
     }
     
     // Menghentikan pembaruan grafik jika hanya data asap yang diperbarui
     if (asapFeeds.length > 0 && airFeeds.length === 0) {
       clearInterval(intervalId);
     }
   }

   // Mengambil data pertama kali saat halaman dimuat
   getData();

   // Memperbarui data setiap 5 detik
   const intervalId = setInterval(getData, 5000);

   // Memperbarui waktu setiap detik
   setInterval(updateClock, 1000);

   // Mode Gelap dan Mode Terang
   function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      modeButton.textContent = '☀️';
    } else {
      modeButton.textContent = '🌙';
    }
  }
  
  // Mode Gelap dan Mode Terang
  const modeButton = document.getElementById('modeButton');
  modeButton.addEventListener('click', toggleDarkMode);