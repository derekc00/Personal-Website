const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto max-w-xl px-4 sm:max-w-2xl md:max-w-4xl lg:max-w-[90rem] sm:px-6 lg:px-8">
      {children}
    </div>
  );
};

export default Container;
