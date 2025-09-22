const Tabs = () => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        <a
          href="#"
          className="whitespace-nowrap border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-200"
        >
          Currency test
        </a>
        <a
          href="#"
          className="whitespace-nowrap border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-200"
        >
          Crypto P&L
        </a>
      </nav>
    </div>
  );
};

export { Tabs };