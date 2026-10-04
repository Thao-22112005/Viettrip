# 🌏 VietTrip

**VietTrip** là hệ thống website đặt tour du lịch được xây dựng theo kiến trúc **Microservices**, hỗ trợ người dùng tìm kiếm tour, xem lịch khởi hành, đặt tour, thanh toán, đánh giá và quản lý đơn đặt tour.

---

## 📌 Giới thiệu

VietTrip được xây dựng với mục tiêu mô phỏng một nền tảng thương mại điện tử du lịch, trong đó hệ thống được chia thành nhiều microservice độc lập.

### Người dùng có thể:

* Đăng ký / đăng nhập tài khoản
* Xác thực tài khoản bằng OTP
* Quên và đặt lại mật khẩu
* Xem danh sách tour
* Xem chi tiết tour
* Xem điểm đến
* Xem danh mục tour
* Xem lịch khởi hành
* Đặt tour
* Theo dõi đơn đặt tour
* Thanh toán
* Yêu cầu hoàn tiền
* Đánh giá tour
* Quản lý thông tin cá nhân

### Quản trị viên có thể:

* Quản lý tài khoản
* Quản lý danh mục
* Quản lý tour
* Quản lý điểm đến
* Quản lý lịch khởi hành
* Quản lý đơn đặt tour
* Quản lý thanh toán
* Xử lý yêu cầu hoàn tiền
* Quản lý đánh giá
* Quản lý thông báo

---

# 🏗️ Kiến trúc hệ thống

VietTrip sử dụng kiến trúc Microservices.

                         ┌─────────────────┐
                         │     React FE    │
                         │   Port: 5173    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   API Gateway   │
                         │   Port: 7264    │
                         └────────┬────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
 ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
 │ AuthService │          │ TourService │          │  Category   │
 │   :7064     │          │   :7275     │          │   :7286     │
 └─────────────┘          └─────────────┘          └─────────────┘
        │                         │
        │                         ▼
        │                  ┌─────────────┐
        │                  │ Destination │
        │                  │   :7113     │
        │                  └─────────────┘
        │
        ├──────────────────────────────────────────────────────┐
        │                                                      │
        ▼                                                      ▼
 ┌─────────────┐                                        ┌─────────────┐
 │   Booking   │                                        │   Payment   │
 │    :7078    │                                        │    :7115    │
 └─────────────┘                                        └──────┬──────┘
                                                               │
                                                               ▼
                                                        ┌─────────────┐
                                                        │  RabbitMQ   │
                                                        └──────┬──────┘
                                                               │
                                                               ▼
                                                        ┌─────────────┐
                                                        │Notification │
                                                        │    :7071    │
                                                        └─────────────┘

 ┌─────────────┐          ┌─────────────┐
 │   Review    │          │    Media    │
 │    :7058    │          │    :7070    │
 └─────────────┘          └─────────────┘


# 🛠️ Công nghệ sử dụng

## Backend

* C#
* ASP.NET Core
* .NET 8
* Entity Framework Core
* SQL Server
* JWT Authentication
* Swagger / OpenAPI
* REST API
* RabbitMQ
* MailKit
* Gmail SMTP
* Cloudinary

## Frontend

* React
* Vite
* JavaScript
* React Router
* Axios
* CSS

## Infrastructure

* Docker
* RabbitMQ
* SQL Server Express
* SQL Server Management Studio (SSMS)

---

# 📦 Các Microservice

| Service             | Port | Chức năng                    |
| ------------------- | ---: | ---------------------------- |
| Gateway             | 7264 | API Gateway                  |
| AuthService         | 7064 | Đăng ký, đăng nhập, JWT, OTP |
| TourService         | 7275 | Quản lý tour                 |
| DestinationService  | 7113 | Quản lý điểm đến             |
| CategoryService     | 7286 | Quản lý danh mục             |
| MediaService        | 7070 | Upload và quản lý hình ảnh   |
| BookingService      | 7078 | Quản lý đơn đặt tour         |
| PaymentService      | 7115 | Quản lý thanh toán           |
| ReviewService       | 7058 | Đánh giá tour                |
| NotificationService | 7071 | Gửi thông báo / email        |

---

# 🗄️ Database

Hệ thống sử dụng **SQL Server Express**.

Mỗi service có database riêng theo hướng Microservices.

Ví dụ:

VietTripAuthDb
VietTripTourDb
VietTripDestinationDb
VietTripCategoryDb
VietTripBookingDb
VietTripPaymentDb
VietTripReviewDb
VietTripNotificationDb


Database được quản lý và kiểm tra bằng:

**SQL Server Management Studio (SSMS)**

Entity Framework Core được sử dụng để:

* Tạo migration
* Cập nhật database
* Quản lý Entity
* Thực hiện CRUD

---

# 🔐 Authentication

VietTrip sử dụng **JWT Authentication**.

Luồng đăng nhập:

User
 │
 ▼
React Frontend
 │
 ▼
API Gateway
 │
 ▼
AuthService
 │
 ├── Kiểm tra Email
 ├── Kiểm tra Password
 └── Tạo JWT Token
       │
       ▼
   React Frontend


JWT Token được sử dụng để xác thực các API yêu cầu đăng nhập.

---

# 📧 OTP & Email

AuthService hỗ trợ:

* OTP đăng ký tài khoản
* OTP xác thực tài khoản
* OTP quên mật khẩu
* Đặt lại mật khẩu
* Gửi email thông qua Gmail SMTP

OTP có thời gian hiệu lực giới hạn và có cơ chế cooldown khi gửi lại.

---

# 🐇 RabbitMQ

RabbitMQ được sử dụng để giao tiếp bất đồng bộ giữa các service.

Ví dụ khi thanh toán thành công:

PaymentService
      │
      │ Payment = Paid
      ▼
  RabbitMQ
      │
      ▼
NotificationService
      │
      ▼
 Gmail / Email


Điều này giúp PaymentService không cần gọi trực tiếp NotificationService.

---

# 💳 Thanh toán

PaymentService hỗ trợ các phương thức:

* Thanh toán Online
* Chuyển khoản ngân hàng
* Thanh toán khi xác nhận

Trạng thái thanh toán:

Pending
   │
   ├── Paid
   │
   └── Failed
         │
         └── Paid

Paid
 │
 └── RefundRequested
          │
          └── Refunded

---

# 🔄 Hoàn tiền

Người dùng có thể yêu cầu hoàn tiền đối với giao dịch đủ điều kiện.

Luồng:

User
 │
 ▼
Booking Detail
 │
 ▼
Yêu cầu hoàn tiền
 │
 ▼
PaymentService
 │
 ▼
RefundRequested
 │
 ▼
Admin xử lý
 │
 ▼
Refunded

---

# ⭐ Đánh giá tour

Người dùng có thể đánh giá tour sau khi hoàn thành chuyến đi.

Mỗi booking chỉ được phép đánh giá một lần.

Thông tin đánh giá gồm:

* User
* Tour
* Booking
* Rating
* Comment
* CreatedAt
* UpdatedAt

---

# ☁️ Media & Cloudinary

MediaService chịu trách nhiệm upload hình ảnh.

Hình ảnh được lưu trữ thông qua **Cloudinary**.

Luồng upload:

React
 │
 ▼
MediaService
 │
 ▼
Cloudinary
 │
 ▼
Image URL
 │
 ▼
Tour / Tour Gallery

---

# 🚀 Cài đặt và chạy project

## 1. Clone project

bash
git clone <repository-url>


Sau đó:

bash
cd VietTrip


---

## 2. Chạy RabbitMQ

RabbitMQ được chạy bằng Docker.

Kiểm tra container:
bash
docker ps


RabbitMQ Management có thể được sử dụng để kiểm tra:

* Exchange
* Queue
* Message
* Consumer
* Publisher

---

## 3. Cấu hình SQL Server

Cấu hình connection string trong `appsettings.json` của từng service.

Ví dụ:

json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=VietTripDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}


Thay `YOUR_SERVER` bằng SQL Server instance của máy.

---

## 4. Chạy Migration

Trong Package Manager Console hoặc terminal:

bash
dotnet ef database update


Hoặc sử dụng:

powershell
Update-Database

cho từng service.

---

# ▶️ Chạy Backend

Có thể chạy từng service bằng Visual Studio hoặc:

bash
dotnet run


Các service chính:

Gateway
AuthService
TourService
DestinationService
CategoryService
MediaService
BookingService
PaymentService
ReviewService
NotificationService

---

# ▶️ Chạy Frontend

Di chuyển vào thư mục Frontend:

bash
cd Frontend

Cài package:

bash
npm install

Chạy project:

bash
npm run dev

Frontend mặc định:

text
http://localhost:5173

---

# 🔗 API Gateway

Frontend giao tiếp với Backend thông qua API Gateway:

text
https://localhost:7264

Ví dụ:

Frontend
   │
   ▼
https://localhost:7264
   │
   ├── /api/Auth
   ├── /api/Tours
   ├── /api/Categories
   ├── /api/Destinations
   ├── /api/Bookings
   ├── /api/Payments
   └── /api/Reviews

---

# 🧪 Kiểm thử API

Backend API có thể được kiểm thử bằng:

* Swagger
* Postman

Quy trình kiểm thử:
Backend
   ↓
Swagger / Postman
   ↓
Kiểm tra API
   ↓
Database
   ↓
Frontend Integration


---

# 📁 Cấu trúc project

VietTrip/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   └── package.json
│
└── VietTrip/
    │
    ├── Gateway/
    ├── AuthService/
    ├── TourService/
    ├── DestinationService/
    ├── CategoryService/
    ├── MediaService/
    ├── BookingService/
    ├── PaymentService/
    ├── ReviewService/
    └── NotificationService/

---

# 🔄 Một số luồng chính

## Đặt tour

User
 ↓
Chọn Tour
 ↓
Chọn lịch khởi hành
 ↓
Nhập thông tin
 ↓
BookingService
 ↓
Tạo Booking
 ↓
Payment

## Thanh toán
Booking
 ↓
PaymentService
 ↓
Pending
 ↓
Paid
 ↓
Booking cập nhật trạng thái
 ↓
RabbitMQ
 ↓
NotificationService
 ↓
Email


## Hoàn tiền
Paid
 ↓
Yêu cầu hoàn tiền
 ↓
RefundRequested
 ↓
Admin xử lý
 ↓
Refunded

## Đánh giá
Completed Booking
 ↓
Đánh giá tour
 ↓
ReviewService
 ↓
Lưu Rating + Comment

---

# 👨‍💻 Development

Project được phát triển theo hướng:

* Backend-first
* Microservices
* RESTful API
* Database per service
* API Gateway
* Asynchronous messaging
* JWT Authentication
* Cloud-based image storage

---

# 📌 Trạng thái project

Các chức năng chính đã được xây dựng:

* [x] Authentication
* [x] OTP
* [x] JWT Login
* [x] Category
* [x] Tour
* [x] Destination
* [x] Tour Schedule
* [x] Media / Cloudinary
* [x] Booking
* [x] Payment
* [x] Review
* [x] Notification
* [x] RabbitMQ
* [x] API Gateway
* [x] Refund flow
* [x] React Frontend
* [x] Admin Management

---

# 📄 License

Project được xây dựng cho mục đích học tập và phát triển đồ án.

**VietTrip © 2026**
