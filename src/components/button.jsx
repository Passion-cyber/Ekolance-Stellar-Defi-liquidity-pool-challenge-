import React from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import LoadingSpinner from "../components/loadingSpinner";

const Button = ({
  href,
  small,
  large,
  className,
  scroll = true,
  outline,
  name,
  onClick,
  icon,
  isLoading,
  type,
  shade,
  ...props
}) => {
  return href ? (
    <div className="relative mr-">
      <div
        className={`rounded border border-[#00ADEF] h-full absolute w-full top-[4px] left-[3px] z-[-1] ${shade}`}
      ></div>
      <Link
        href={href}
        {...props}
        className={twMerge(
          `${
            outline
              ? "bg-transparent text-[#00ADEF] border border-[#00ADEF]"
              : "bg-[#00ADEF] text-[#FCFCFC]"
          } rounded-[4px] transition-all leading-none ease-in duration-500 text-[14px] font-medium ${
            !props.disabled
              ? "hover:scale-[1.02] active:scale-[0.95] hover:top-1 hover:left-1"
              : ""
          } min-w-full flex items-center place-items-center justify-center gap-2 px-[18px] py-2 capitalize relative z-20`,
          className
        )}
        onClick={onClick}
      >
        {isLoading ? <LoadingSpinner /> : name}
        {icon && <Image src={icon} className="w-4" alt="icon" />}
      </Link>
    </div>
  ) : (
    <div className="relative mr-">
      <div
        className={twMerge(
          `rounded border border-[#00ADEF] h-full absolute w-full top-[4px] left-[3px] z-10 ${shade}`
        )}
      ></div>
      <button
        disabled={isLoading}
        type={type}
        {...props}
        className={twMerge(
          `${
            outline
              ? "bg-transparent text-[#00ADEF] border border-[#00ADEF]"
              : "bg-[#00ADEF] text-[#FCFCFC]"
          } rounded-[4px] transition-all leading-none ease-in duration-500 text-[14px] font-medium ${
            !props.disabled
              ? "hover:scale-[1.02] active:scale-[0.95] hover:top-1 hover:left-1"
              : ""
          }  min-w-full
      flex items-center place-items-cente justify-center gap-2 px-[18px] py-2 capitalize relative z-20`,
          className
        )}
        onClick={onClick}
      >
        {isLoading ? <LoadingSpinner /> : name}
        {icon && <Image src={icon} className="w-4" alt="icon" />}
      </button>
    </div>
  );
};

export default Button;
