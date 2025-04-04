import Link from "next/link";
import Image from "next/image";

const linkList = [
  { img: "/icon/github.svg", src: "https://github.com/waynechoidev" },
];

export default function About() {
  return (
    <div className="max-w-profile_out mx-auto text-right">
      <div className="flex flex-col items-end max-w-profile_in ml-auto">
        <h1 className="my-2">Hi!</h1>
        <p className="my-2">I am Wayne, living in New Zealand.</p>
        <p className="my-2">
          I am a software engineer with a passion for creating cutting-edge
          software solutions. Currently working for a fintech startup,
          developing a web-based CRM system.
        </p>
        <p className="my-2">
          I love graphics programming and enjoy working on both web and native
          platforms. I find joy in exploring advanced concepts in computer
          graphics, and I am also deeply interested in computer vision,
          exploring its applications and technologies.
        </p>
        <p className="my-2">
          Before getting into software engineering, I was a qualified boat
          builder in New Zealand with 7 years of experience, specializing in
          high-performance boats, including RIBs for the Coast Guard and
          Emirates Team New Zealand.
        </p>
        <div className="flex flex-row space-x-3 mt-10">
          {linkList.map((link) => (
            <Link key={link.img} href={link.src} target="_blank">
              <Image
                src={link.img}
                width={48}
                height={48}
                alt={link.src}
                className="hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
