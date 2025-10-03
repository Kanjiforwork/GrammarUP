export default function ExercisePage() {
  return (
    <div className="w-full min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Exercise</h1>
      <p className="text-lg text-gray-600">Luyện tập ngữ pháp tiếng Anh</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/exercise/1" className="p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Exercise 1</h3>
          <p className="text-gray-600">Bài tập ngữ pháp cơ bản</p>
        </a>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Exercise 2</h3>
          <p className="text-gray-600">Bài tập nâng cao</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Exercise 3</h3>
          <p className="text-gray-600">Bài tập tổng hợp</p>
        </div>
      </div>
    </div>
  );
}