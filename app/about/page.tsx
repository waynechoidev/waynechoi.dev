import Link from "next/link";
import Image from "next/image";

const linkList = [
  { img: "/icon/github.svg", src: "https://github.com/waynechoidev" },
  { img: "/icon/gmail.svg", src: "mailto:wonjun92@gmail.com" },
  {
    img: "/icon/linkedin.svg",
    src: "https://www.linkedin.com/in/wonjun-wayne-choi",
  },
  { img: "/icon/twitter.svg", src: "https://twitter.com/waynechoidev" },
];

export default function About() {
  return (
    <div className="max-w-profile_out mx-auto text-right">
      <div className="flex flex-col items-end max-w-profile_in ml-auto">
        <h1>Hi!</h1>
        <p className="my-2">I am Wayne, living in NZ.</p>
        <p className="my-2">
          A frontend engineer with a passion for creating cutting-edge user
          interfaces. Currently working for a fintech startup, and developing a
          web-based CRM.
        </p>
        <p className="my-2">
          Love graphics programming, and enjoy working for both web and native
          platforms. Strugling with mathematics, and computer science.
        </p>
        <p className="my-2">
          NZ qualified boat builder with 7 years past expierence. Maybe the
          software engineer who is the most skilled at building boats
          nationwide.
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
