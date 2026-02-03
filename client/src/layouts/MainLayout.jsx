import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import UploadModal from "../components/UploadModal";

const MainLayout = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = (media) => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header onUploadClick={() => setUploadModalOpen(true)} />
      <main>
        <Outlet context={{ refreshTrigger }} />
      </main>
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default MainLayout;
