export default function LessonsPage() {
  return (
    <div className="w-full min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Lessons</h1>
      <p className="text-lg text-gray-600">Học các bài ngữ pháp tiếng Anh</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Lesson 1: Present Simple</h3>
          <p className="text-gray-600">Học thì hiện tại đơn</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Lesson 2: Past Simple</h3>
          <p className="text-gray-600">Học thì quá khứ đơn</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Lesson 3: Present Perfect</h3>
          <p className="text-gray-600">Học thì hiện tại hoàn thành</p>
        </div>
      </div>
    </div>
  );
}