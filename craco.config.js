module.exports = {
  webpack: {
    configure: {
      // Disable source maps in development
      devtool: false,
      
      // Ignore all source map warnings
      ignoreWarnings: [
        {
          module: /node_modules\/lucide-react/,
        },
        {
          file: /node_modules\/lucide-react/,
        },
        (warning) => warning.message.includes('source-map-loader'),
        (warning) => warning.message.includes('Failed to parse source map')
      ],
    },
  },
  // Disable source maps for CSS
  style: {
    css: {
      loaderOptions: {
        sourceMap: false,
      },
    },
  }
}; 