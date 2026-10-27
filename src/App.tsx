import React from 'react';
import RegistrationForm from './components/RegistrationForm';
import MembershipCard from './components/MembershipCard';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-amber-700">MemberHub</h1>
      </header>
      <main>
        <RegistrationForm />
      </main>
    </div>
  );
}

export default App;
