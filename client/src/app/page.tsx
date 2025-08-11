import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold">Welcome to the Marvel App</h1>
        <p className="mt-4 text-lg text-color">Explore the Marvel universe like never before.</p>
      </div>
    </div>
  );
}
