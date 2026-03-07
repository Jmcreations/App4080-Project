const ctx = document.getElementById('workloadChart').getContext('2d');

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            data: [6, 8, 5, 9, 7, 4, 3],
            backgroundColor: '#4f46e5',
            borderRadius: 6
        }]
    },
    options: {
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 3 }
            }
        }
    }
});