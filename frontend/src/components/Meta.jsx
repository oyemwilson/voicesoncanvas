import { Helmet } from 'react-helmet-async';

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keyword' content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: 'Welcome To Voices on Canvas',
  description: 'Discover, buy, and sell African art from emerging and established creators.',
  keywords: 'african art, art, emerging artists, established artists, buy art, sell art',
};

export default Meta;
