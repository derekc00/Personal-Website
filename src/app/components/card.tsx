import Image from "next/image";
import Link from "next/link";

interface CardProps {
  title: string;
  date: string;
  image?: string;
  tags: string[];
  slug: string;
}

const Card = ({ slug, title, date, image, tags }: CardProps) => {
  return (
    <div className="rounded overflow-hidden shadow-lg w-full">
      <Link href={`/blog/${slug}`}>
        <Image
          className="w-full"
          src={image || ""}
          alt={title}
          width={800}
          height={600}
        />
        <div className="px-6 py-4">
          <div className="text-gray-600 text-sm mb-2 bg-yellow-100 inline-block px-2 rounded">
            {date}
          </div>
          <div className="font-bold text-xl mb-2">{title}</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};
export default Card;
