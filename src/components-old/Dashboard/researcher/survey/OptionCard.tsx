type OptionCardProps = {
    type: "external" | "aiTaskBuilder";
    selected: "external" | "aiTaskBuilder" | null;
    setSelected: (value: "external" | "aiTaskBuilder") => void;
    title: string;
    description: string;
  };
  const OptionCard = ({
    type,
    selected,
    setSelected,
    title,
    description,
  }: OptionCardProps) => {
    const optionStyles = `border rounded-2xl p-5 pt-12 ps-12 flex-1 flex flex-col gap-3 relative cursor-pointer transition
      ${
        selected === type
          ? "border-yellow-400 ring-2 ring-yellow-400 shadow-lg bg-yellow-50"
          : "border-gray-200 hover:shadow-lg"
      }`;
  
    const radioStyles = `h-5 w-5 rounded-full absolute top-4 left-4 flex items-center justify-center
      ${selected === type ? "border-yellow-400 border-2" : "border-gray-300 border"}`;
  
    const innerDot = selected === type ? "h-2.5 w-2.5 bg-yellow-400 rounded-full" : "";
  
    return (
      <div onClick={() => setSelected(type)} className={optionStyles}>
        <div className={radioStyles}>
          <div className={innerDot} />
        </div>
        <h1 className="font-bold">{title}</h1>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    );
  };

  export default OptionCard