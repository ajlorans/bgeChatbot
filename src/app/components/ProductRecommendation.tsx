import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ProductProps {
  name: string;
  description: string;
  price: string;
  url: string;
  imageUrl?: string;
}

interface ProductBundleProps {
  name: string;
  description: string;
  products: ProductProps[];
  totalPrice: string;
  discount?: string;
}

interface ProductRecommendationProps {
  products?: ProductProps[];
  bundles?: ProductBundleProps[];
  message: string;
}

export function ProductRecommendation({
  products,
  bundles,
  message,
}: ProductRecommendationProps) {
  // Function to convert markdown links to JSX
  const renderMessage = (text: string) => {
    // Regex to match markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    // Split the text by markdown links
    const parts = text.split(linkRegex);

    // Create an array to hold the rendered parts
    const renderedParts: React.ReactNode[] = [];

    // Process each part
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        // This is regular text
        renderedParts.push(
          <span key={`text-${i}`} className="text-gray-900 dark:text-gray-100">
            {parts[i].split("\n").map((line, j) => (
              <React.Fragment key={`line-${j}`}>
                {line}
                {j < parts[i].split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      } else if (i % 3 === 1) {
        // This is the link text
        const linkText = parts[i];
        const linkUrl = parts[i + 1];

        renderedParts.push(
          <Link
            key={`link-${i}`}
            href={linkUrl}
            className="text-green-600 hover:text-green-800 font-medium dark:text-green-400 dark:hover:text-green-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkText}
          </Link>
        );
      }
      // Skip the URL part (i % 3 === 2) as it's already used
    }

    return renderedParts;
  };

  // Function to render a product card
  const renderProductCard = (product: ProductProps, index: number) => (
    <div
      key={`product-${index}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
    >
      {product.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {product.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          {product.description}
        </p>
        <p className="text-green-600 font-bold mt-2">{product.price}</p>
      </div>
      <div className="p-4 pt-0">
        <Link
          href={product.url}
          className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Product
        </Link>
      </div>
    </div>
  );

  // Function to render a bundle card
  const renderBundleCard = (bundle: ProductBundleProps, index: number) => (
    <div
      key={`bundle-${index}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 col-span-full"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {bundle.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {bundle.description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-green-600 font-bold text-xl">
              {bundle.totalPrice}
            </p>
            {bundle.discount && (
              <p className="text-green-500 text-sm">{bundle.discount}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Includes:
          </h4>
          <ul className="mt-2 space-y-1">
            {bundle.products.map((product, i) => (
              <li
                key={`bundle-product-${i}`}
                className="text-sm text-gray-600 dark:text-gray-400 flex justify-between"
              >
                <span>{product.name}</span>
                <span className="text-gray-500">{product.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-4 pt-0">
        <Link
          href={
            bundle.products[0].url.split("/products/")[0] +
            "/collections/bundles"
          }
          className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Bundle
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
      <div className="mb-4 text-gray-900 dark:text-gray-100">
        {renderMessage(message)}
      </div>

      {products && products.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recommended Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(renderProductCard)}
          </div>
        </div>
      )}

      {bundles && bundles.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Value Bundles
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {bundles.map(renderBundleCard)}
          </div>
        </div>
      )}
    </div>
  );
}
