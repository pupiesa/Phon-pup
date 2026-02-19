import React from "react";

function PopupName() {
  const items = [
    {
      id: 1,
      stid: "66200011",
      name: "นายกฤตพัฒน์ ยืดยาว",
      image: "gadow.jpg",
      detail: "Shadow Dweller of the Terminal",
    },
    {
      id: 2,
      stid: "66200082",
      name: "นายดัสกร ทับแสง",
      image: "pup.jpg",
      detail: "Phantom of the Legacy Code",
    },
    {
      id: 3,
      stid: "66200166",
      name: "นายพงศ์พณิช อินทร์เทพ",
      image: "jame.jpg",
      detail: "The Unbreachable Aegis of the Seventh Layer",
    },
    {
      id: 4,
      stid: "66200326",
      name: "นายกิตตินันท์ คูหา",
      image: "sunny.jpg",
      detail: "Ethereal Weaver of the Web",
    },
    {
      id: 5,
      stid: "66200396",
      name: "นางสาววิชญาพร ยาจิ๋ว",
      image: "kyo.jpg",
      detail: "High Priest of the Caffeine Cult",
    },
    {
      id: 6,
      stid: "66200415",
      name: "นายสุรชาติ คงสงค์",
      image: "ball.jpg",
      detail: "The Midnight Committer",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row 
                     bg-[#e67e00] rounded-3xl shadow-lg 
                     overflow-hidden hover:scale-[1.02] 
                     transition-transform duration-300"
        >
          {/* รูป */}
          <img
            src={item.image}
            alt={item.name}
            className="w-full sm:w-64 h-56 object-cover"
          />

          {/* ข้อมูลด้านขวา */}
          <div className="flex flex-col justify-center p-6 text-white">
            <h2 className="text-xl font-bold mb-2">{item.stid}</h2>
            <h2 className="text-xl font-bold mb-2">{item.name}</h2>
            <p className="text-sm opacity-90">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PopupName;
