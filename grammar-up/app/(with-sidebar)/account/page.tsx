export default function AccountPage() {
  return (
    <div className="w-full min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Account</h1>
      <p className="text-lg text-gray-600 mb-8">Quản lý tài khoản của bạn</p>
      
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Thông tin cá nhân</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">user@example.com</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tên</label>
              <p className="text-lg">Người dùng</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Tiến độ học tập</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Bài học hoàn thành</p>
              <p className="text-2xl font-bold text-blue-600">5/20</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bài tập hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">12/50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}