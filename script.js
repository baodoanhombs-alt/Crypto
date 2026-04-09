document.addEventListener("DOMContentLoaded", () => {
    // 1. Cấu hình Intersection Observer cho hiệu ứng Animation khi cuộn (Scroll Reveal)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Kích hoạt khi phần tử hiện ra 15% trên màn hình
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); // Thêm class 'active' để chạy CSS animation fade-up/reveal
                observer.unobserve(entry.target); // Chỉ chạy 1 lần duy nhất cho mỗi phần tử
            }
        });
    }, observerOptions);

    // Bắt đầu theo dõi tất cả các phần tử có class .fade-up hoặc .reveal
    const animatedElements = document.querySelectorAll('.fade-up, .reveal');
    animatedElements.forEach(el => observer.observe(el));

    // 2. Logic cho Bộ đếm ngược thời gian (Countdown Timer) theo yêu cầu
    // Thiết lập thời gian đếm ngược ban đầu là 2 giờ 45 phút 30 giây (tính bằng giây)
    const countdownDuration = (2 * 60 * 60) + (45 * 60) + 30; 
    
    // Kiểm tra xem đã có dữ liệu đếm ngược trong Local Storage chưa (để người dùng F5 web không bị reset lại từ đầu)
    let remainingTime = localStorage.getItem('cryptoCountdownTime');
    
    if (!remainingTime) {
        // Nếu chưa có, bắt đầu từ thời gian mặc định
        remainingTime = countdownDuration;
    } else {
        // Nếu đã có, chuyển đổi giá trị lấy được sang dạng số nguyên
        remainingTime = parseInt(remainingTime);
    }

    // Lấy các phần tử hiển thị Giờ, Phút, Giây
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // Hàm cập nhật bộ đếm mỗi giây
    const updateCountdown = () => {
        if (remainingTime <= 0) {
            remainingTime = 0; // Nghỉ đếm khi về 0
            // Tuỳ chọn: Có thể hiện thông báo "Hết hạn" ở đây
        }

        // Toán học chuyển đổi giây sang Giờ, Phút, Giây
        const h = Math.floor(remainingTime / 3600);
        const m = Math.floor((remainingTime % 3600) / 60);
        const s = remainingTime % 60;

        // Định dạng hiển thị luôn có 2 chữ số (VD: 09 thay vì 9)
        hoursEl.innerText = h < 10 ? '0' + h : h;
        minutesEl.innerText = m < 10 ? '0' + m : m;
        secondsEl.innerText = s < 10 ? '0' + s : s;

        // Giảm thời gian và lưu lại vào bộ nhớ trình duyệt mỗi giây
        if (remainingTime > 0) {
            remainingTime--;
            localStorage.setItem('cryptoCountdownTime', remainingTime);
        }
    };

    setInterval(updateCountdown, 1000); // Chạy hàm update mỗi 1000ms (1 giây)
    updateCountdown(); // Chạy ngay lập tức lần đầu tiên thay vì chờ 1 giây

    // 3. Xử lý Form thu thập thông tin khách hàng (Simulate Submission)
    const form = document.getElementById('leadForm');
    const toast = document.getElementById('toast');

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Ngăn chặn trang bị tải lại
        
        // Lấy dữ liệu người dùng nhập
        const fullName = document.getElementById('fullName').value;
        const contactInfo = document.getElementById('contactInfo').value;
        const emailInfo = document.getElementById('emailInfo').value;

        // Xử lý hiệu ứng hiển thị trạng thái "Đang xử lý..."
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;

        // Map dữ liệu vào các cột name, phone, email của Sheet
        const formData = new FormData();
        formData.append('name', fullName);
        formData.append('phone', contactInfo);
        formData.append('email', emailInfo);

        // Gửi tới Google Sheets App Script URL
        const scriptURL = 'https://script.google.com/macros/s/AKfycbzDDhuzdg9FSEXuNMY2kXh1LcZA9ntc4KKxvGuknC8STzbfMyD4TjS68MEv7U_kGtGVsA/exec';
        
        fetch(scriptURL, { method: 'POST', body: formData})
            .then(response => {
                // Trả lại trạng thái cho nút bấm
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Xoá trắng các trường trong form
                form.reset();

                // Hiển thị thông báo (Toast message) đăng ký thành công
                toast.classList.add('show');
                
                // Ẩn thông báo sau 3.5 giây
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3500);
            })
            .catch(error => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                alert('Có lỗi xảy ra, vui lòng thử lại sau!');
                console.error('Error!', error.message);
            });
    });

    // 4. Smooth Scrolling cho các nút liên kết (Anchor links)
    // Khi bấm vào nút "Nhận Tư Vấn", trang sẽ cuộn mượt mà xuống phần Form thiết lập
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
