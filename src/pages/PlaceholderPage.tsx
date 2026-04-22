type PlaceholderPageProps = {
  title: string;
};

const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return <h1>{title}</h1>;
};

export default PlaceholderPage;
