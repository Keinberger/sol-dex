import { useEffect, useState } from "react"
import { ShareIcon } from "@heroicons/react/24/outline"

import { ConnectButton } from "@web3uikit/web3"
import { useNotification } from "@web3uikit/core"
import { useCookies } from "react-cookie"
import { tallyUrl } from "../constants/config"

export default function NavBar(props) {
    const dispatch = useNotification()
    const [switcherClicked, setSwitcherClicked] = useState(false)
    const [cookies, setCookie] = useCookies(["currentSite", "latestMessage"])

    const latestMessage = cookies.latestMessage
    let lastMessage = ""
    useEffect(() => {
        if (
            latestMessage !== undefined &&
            latestMessage != lastMessage &&
            latestMessage != "undefined"
        ) {
            lastMessage = latestMessage
            dispatch({
                type: latestMessage.kind, // error, info, success, warning (orange)
                message: latestMessage.text,
                title: "DEX",
                icon: undefined,
                position: "topR",
            })
        }
        setCookie("latestMessage", "undefined")
    }, [latestMessage])

    return (
        <section>
            <nav className="relative container mx-auto py-6">
                <div className="flex items-center justify-between mx-auto pt-5">
                    {/* <div></div> */}

                    <div className="hidden lg:flex lg:scale-100 space-x-4 mx-auto text-base bg-black py-1 px-1 rounded-xl border-gray-900 drop-shadow-xl">
                        {props.items.map((item, index) => (
                            <button
                                className={`${
                                    index == props.activeItem ? "bg-neutral-900" : ""
                                } menuButton`}
                                onClick={() => {
                                    props.contentFunc(index)
                                    setCookie("currentSite", index)
                                }}
                                key={index}
                            >
                                {item}
                            </button>
                        ))}

                        <a href={tallyUrl} target="_blank">
                            <button className={`items-center flex menuButton`}>
                                Governance
                                <ShareIcon className="w-6 ml-1" />
                            </button>
                        </a>
                    </div>

                    <div className="block">
                        <ConnectButton
                            moralisAuth={false}
                            className="shadow-xl border rounded-xl"
                        />
                    </div>

                    <button
                        className={`${
                            switcherClicked ? "open" : ""
                        } hamburger px-5 mt-2 lg:hidden focus:outline-none`}
                        onClick={() => {
                            setSwitcherClicked(!switcherClicked)
                        }}
                    >
                        <span className="hamburger-top"></span>
                        <span className="hamburger-middle"></span>
                        <span className="hamburger-bottom"></span>
                    </button>
                </div>

                <div className="lg:hidden">
                    <div className={`${switcherClicked ? "active" : ""} dropdown`}>
                        {props.items.map((item, index) => (
                            <button
                                className={`${
                                    index == props.activeItem ? "bg-neutral-900" : ""
                                } menuButton`}
                                onClick={() => {
                                    props.contentFunc(index)
                                    setCookie("currentSite", index)
                                    setSwitcherClicked(!switcherClicked)
                                }}
                                key={index}
                            >
                                {item}
                            </button>
                        ))}
                        <a href={""} target="_blank">
                            <button className={`items-center flex menuButton`}>
                                Governance
                                <ShareIcon className="w-4 ml-1" />
                            </button>
                        </a>
                    </div>
                </div>
            </nav>
        </section>
    )
}
