import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOMetaTagsProps {
  title: string;
  description: string;
  // Add other SEO-related props as needed
}

const SEOMetaTags: React.FC<SEOMetaTagsProps> = ({ title, description }) => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {/* Add other meta tags as needed */}
      </Helmet>
    </HelmetProvider>
  );
};

export default SEOMetaTags;