import {signIn, signOut, useSession} from "next-auth/react";
import Image from "next/image";
import axios from "../lib/axios";
import {useEffect, useState} from "react";
import Link from "next/link";

interface UserData {
  name: string;
  avatar: string;
}

export default function ProfileNav() {
  // https://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro
  const {data: session, status} = useSession()
  const [user, setUser] = useState<UserData>()

  useEffect(() => {
    if (session && !user) {
      axios.get("/userdata").then(res => {
        setUser({
          name: res.data.name,
          avatar: res.data.avatar
        })
      })
    }
  }, [session, user])

  if (user) {
    return (
        <li tabIndex={0}>
          <a className="mx-1 flex flex-row">
            <div className="avatar">
              <Image width={28} height={28} className="rounded-full" src={user?.avatar!} alt=""/>
            </div>
            <span>{user.name}</span>
          </a>
          <ul className="p-2 bg-base-200 gap-1 left-0 top-full">
            <li><Link href="/account/settings"><a>Settings</a></Link></li>
            <li><a onClick={() => signOut()}>Sign out</a></li>
          </ul>
        </li>
    )
  } else {
    return (
        <li>
          <a className="mx-1" onClick={() => signIn()}>Sign in</a>
        </li>
    )
  }
}