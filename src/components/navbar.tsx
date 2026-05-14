import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";

export default async function Navbar() {
  return (
    <nav className='sticky top-0 w-full border-b border-gray-200'>
      <div className='flex h-16 items-center justify-between px-4 mx-auto'>
        <Link href='/'>Home</Link>
        <Suspense>
          <User />
        </Suspense>
      </div>
    </nav>
  );
}

async function User() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <div className='flex items-center gap-4'>
      {data?.claims ? (
        <>
          <Link href='/'>
            <Button variant='ghost' className='text-gray-700 hover:text-black'>
              Invalid Items
            </Button>
          </Link>
          <Link href='/'>
            <Button variant='ghost' className='text-gray-700 hover:text-black'>
              Dashboard
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className='w-8 h-8'>
                <AvatarFallback className='text-white bg-primary'>
                  {data?.claims.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className='w-56' align='end'>
              <DropdownMenuLabel className='font-normal'>
                <p className='text-xs leading-none text-muted-foreground'>{data?.claims?.email}</p>
              </DropdownMenuLabel>
              <SignOutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Link href='/login'>
          <Button variant='ghost' className='text-gray-700 hover:text-black'>
            Log In
          </Button>
        </Link>
      )}
    </div>
  );
}
