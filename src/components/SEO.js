import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, image }) => {
    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{title}</title>
            <meta name='description' content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}
            <meta property="og:site_name" content="CureBird" />

            {/* Twitter */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
}

// Default props for fallback
SEO.defaultProps = {
    title: 'CureBird | AI-Powered Personal Medical Portfolio',
    description: 'Securely manage your medical history, track vital trends, and get AI-powered health insights.',
    name: 'CureBird',
    type: 'website',
    image: 'https://curebird-project.vercel.app/og-image.jpg'
};

export default SEO;
