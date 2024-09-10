/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
       remotePatterns: [
        {
            hostname: "localhost",
            pathname: "/**",
            port: '5000',
        }
       ]
    }
};

export default nextConfig;
