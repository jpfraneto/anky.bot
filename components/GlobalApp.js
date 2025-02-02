import React, { useEffect, useState } from "react";
import DesktopWritingGame from "./DesktopWritingGame";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Righteous } from "next/font/google";
import { WebIrys } from "@irys/sdk";
import { getAnkyverseDay, getAnkyverseQuestion } from "../lib/ankyverse";
import { useUser } from "../context/UserContext";
import Offcanvas from "react-bootstrap/Offcanvas";
import Image from "next/image";
import FeedByFidPage from "./FeedByFidPage";
import { getThisUserWritings } from "../lib/irys";
import { IndividualWritingDisplayModal } from "./IndividualWritingDisplayModal";
import Button from "./Button";
import {
  FaPencilAlt,
  FaRegComment,
  FaRegCommentDots,
  FaUserAstronaut,
} from "react-icons/fa";
import { getOneWriting } from "../lib/irys";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import IndividualWritingDisplayPage from "./IndividualWritingDisplayPage"
import { MdMenuOpen } from "react-icons/md";
import UserDisplayPage from "./UserDisplayPage";
import { IoIosHome, IoMdSettings } from "react-icons/io";
import { DEFAULT_CAST, LOCAL_STORAGE_KEYS } from "../lib/constants";
import { GiRollingEnergy } from "react-icons/gi";
import { ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSettings } from "../context/SettingsContext";
import { fetchUserDementors } from "../lib/notebooks";
import { Transition } from "react-transition-group";
import airdropABI from "../lib/airdropABI.json";
import InstallPwaModal from "./InstallPwaModal";
import { BsInfoLg } from "react-icons/bs";
import BountyPage from "./BountyPage";
import WhatIsThisPage from "./WhatIsThisPage";
import LandingPage from "./LandingPage";
import ReadIrysPage from "./ReadIrysPage";
import DashboardPage from "./DashboardPage";
import ReadCastPage from "./ReadCastPage";
import ProfilePage from "./ProfilePage";
import { FaChartLine } from "react-icons/fa";
import Irys from "./Irys";
import WelcomePage from "./WelcomePage";
import UserFeed from "./UserFeed";
import GlobalFeed from "./GlobalFeed";
import SettingsPage from "./SettingsPage";
import FarcasterPage from "./FarcasterPage";
import ManaPage from "./mana/ManaPage";
import FarcasterFeedPage from "./FarcasterFeedPage";
import axios from "axios";
import Leaderboard from "./Leaderboard";
import AboutModal from "./AboutModal";
import TimerSettingsModal from "./TimerSettingsModal";
import AskFarcaster from "./AskFarcaster";

const righteous = Righteous({ weight: "400", subsets: ["latin"] });

const ankyverseToday = getAnkyverseDay(new Date());
const ankyverseQuestion = getAnkyverseQuestion(ankyverseToday.wink);

const GlobalApp = ({ alchemy, loginResponse }) => {
  const {
    login,
    authenticated,
    ready,
    loading,
    logout,
    user,
    getAccessToken,
    exportWallet,
  } = usePrivy();
  const {
    setUserAppInformation,
    userAppInformation,
    setUserDatabaseInformation,
    userOwnsAnky,
    setUserOwnsAnky,
    mainAppLoading,
    farcasterUser,
    setFarcasterUser,
    userDatabaseInformation,
    allUserWritings,
    setAllUserWritings,
  } = useUser();
  const { userSettings, setUserSettings } = useSettings();
  const [text, setText] = useState("");
  const router = useRouter();
  const [lifeBarLength, setLifeBarLength] = useState(100);
  const [displayManaInfo, setDisplayManaInfo] = useState(false);
  const [gameProps, setGameProps] = useState({});
  const [castWrapper, setCastWrapper] = useState(null);
  const [displayNavbar, setDisplayNavbar] = useState(false);
  const [promptFromAnkyBeingTagged, setPromptFromAnkyBeingTagged] = useState(
    {}
  );

  const [isMobile, setIsMobile] = useState(false);


  const [refreshUsersStateLoading, setRefreshUsersStateLoading] =
    useState(false);
  const [checkingIfYouOwnAnky, setCheckingIfYouOwnAnky] = useState(false);
  const [ankyButtonText, setAnkyButtonText] = useState("i already own one");
  const [writingForDisplay, setWritingForDisplay] = useState(null);
  const [parentCastForReplying, setParentCastForReplying] = useState("");
  const [disableButton, setDisableButton] = useState(false);
  const [theAsyncCastToReply, setTheAsyncCastToReply] = useState(null);
  const [displayInstallPWA, setDisplayInstallPWA] = useState(false);
  const [copyWalletAddressText, setCopyWalletAddressText] = useState("");
  const [displayAboutModal, setDisplayAboutModal] = useState(false);
  const [displaySettingsModal, setDisplaySettingsModal] = useState(false);
  const [thisIsTheFlag, setThisIsTheFlag] = useState(false);
  const [displayRightNavbar, setDisplayRightNavbar] = useState(false);
  const [userWritingsHere, setUserWritingsHere] = useState([]);
  const [thisIsThePrompt, setThisIsThePrompt] = useState("");
  const [countdownTarget, setCountdownTarget] = useState(0);
  const [show, setShow] = useState(false);
  const [displayWritingGameLanding, setDisplayWritingGameLanding] =
    useState(true);
  const [userWallet, setUserWallet] = useState(null);
  const [userIsMintingAnky, setUserIsMintingAnky] = useState(false);
  const wallets = useWallets();
  const wallet = wallets.wallets[0];

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 666);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchCastInformation = async () => {
      try {
        if (!router && !router.query) return;

        async function searchThisText() {
          const writingFromIrys = await getOneWriting(router.query.cid);
          setPromptFromAnkyBeingTagged({
            text: writingFromIrys.text,
            timestamp: new Date(),
          });
        }
        async function fetchCastWrapper() {
          try {
            if (!router.query.cid) return;
            const responseFromServer = await axios.get(
              `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/cast-by-cid/${router.query.cid}`
            );
            if (!responseFromServer.data.castWrapper) return;
            setCastWrapper(responseFromServer.data.castWrapper);
            const warpcastUrl = `https://warpcast.com/${
              responseFromServer.data.cast.author.username
            }/${responseFromServer.data.castWrapper.castHash.slice(0, 10)}`;
            setParentCastForReplying(warpcastUrl);
            fetchCastForReplyInformation(warpcastUrl);
          } catch (error) {
            console.log(
              "there was an error in the fetch cast wrapper function"
            );
          }
        }
        searchThisText();
        fetchCastWrapper();
      } catch (error) {
        console.log("there was an error");
      }
    };
    fetchCastInformation();
  }, [router.query]);

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
    if (storedData) {
      const user = JSON.parse(storedData);
      if (!farcasterUser.fid) setFarcasterUser(user);
      if (user.fid && !farcasterUser.pfp) {
        getThisUserInformation(user.fid);
      }
    }
    async function getThisUserInformation(fid) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/u/${fid}`
        );
        setFarcasterUser((prev) => {
          return {
            ...prev,
            displayName: response.data.user.displayName,
            followerCount: response.data.user.followerCount,
            followingCount: response.data.user.followingCount,
            pfp: response.data.user.pfp.url,
            bio: response.data.user.profile.bio,
            username: response.data.user.username,
          };
        });
      } catch (error) {
        console.log("there was an error getting the user informaton");
      }
    }
  }, []);

  useEffect(() => {
    if (user && user.wallet) {
      setCopyWalletAddressText(user.wallet.address);
    }
  }, [authenticated]);

  async function uploadPromptToIrys(prompt) {
    try {
      const getWebIrys = async () => {
        if (!wallet) return;
        const url = "https://node2.irys.xyz";
        const token = "ethereum";
        const rpcURL = "";

        const provider = await wallet.getEthersProvider();
        if (!provider) throw new Error(`Cannot find privy wallet`);

        const irysWallet =
          wallet?.walletClientType === "privy"
            ? { name: "privy-embedded", provider, sendTransaction }
            : { name: "privy", provider };

        const webIrys = new WebIrys({ url, token, wallet: irysWallet });
        await webIrys.ready();
        return webIrys;
      };
      if (wallet && authenticated) {
        console.log("weeeee have a wallet");
        const webIrys = await getWebIrys();
        const tags = [
          { name: "Content-Type", value: "text/plain" },
          { name: "application-id", value: "Anky Dementors" },
          { name: "container-type", value: "prompts-notebook" },
        ];
        console.log("right before uploading");
        const receipt = await webIrys.upload(prompt, { tags });
        console.log("weeee have a receipt", receipt);
        return receipt.id;
      } else {
        console.log("there is no wallet");
        let responseFromIrys = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/upload-writing`,
          {
            text: prompt,
          }
        );
        console.log("IN HERE, THE REPSONSE FROM IRYS IS: ", responseFromIrys);
        let cid = responseFromIrys.data.cid;
        console.log("weeee have a cid", cid);
        return cid;
      }
    } catch (error) {
      console.log("there was an error uploading the thing to irys", error);
    }
  }

  async function copyWalletAddress() {
    try {
      setCopyWalletAddressText("copied your wallet address");
      await navigator.clipboard.writeText(user.wallet.address);
      setTimeout(() => {
        setCopyWalletAddressText(user.wallet.address);
      }, 1111);
    } catch (error) {
      console.log("there was an error copying the wallet address");
    }
  }

  async function fetchCastForReplyInformation(warpcastUrl) {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/api/get-cast`,
        { url: warpcastUrl }
      );
      console.log("the response from the server is: ", response);
      setTheAsyncCastToReply(response.data.cast);
    } catch (error) {
      console.log(
        "there was an error on the fetchCastForReplyInformation",
        error
      );
    }
  }

  async function refreshUsersState() {
    try {
      console.log("refreshing the users state");
      if (!authenticated) return;
      setRefreshUsersStateLoading(true);
      console.log("the user is: ", user, authenticated);
      const authToken = await getAccessToken();
      console.log("the auth token is:", authToken);
      const thisUserPrivyId = user.id.replace("did:privy:", "");
      const thisFarcasterAccount = farcasterUser || null;
      if (!thisFarcasterAccount?.fid) thisFarcasterAccount.fid = null;
      console.log(
        "right before sending the post request to the database to get the users information",
        thisUserPrivyId,
        authToken
      );
      if (!authToken) return setRefreshUsersStateLoading(false);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/user/${thisUserPrivyId}`,
        { thisFarcasterAccount },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      function sortWritings(a, b) {
        const timestampA = a.timestamp;
        const timestampB = b.timestamp;
        return timestampB - timestampA;
      }
      async function getAllUserWritings() {
        if (!wallet) return;
        if (!authenticated) return;
        console.log("IN HEREEEE, THE WALLET IS.", wallet);
        const writings = await getThisUserWritings(wallet.address);
        const sortedWritings = writings.sort(sortWritings);
        console.log(
          "all the sorted writings are: inside the global app",
          sortedWritings
        );
        setAllUserWritings(sortedWritings);
        setUserWritingsHere(sortedWritings);
      }

      getAllUserWritings();

      setUserDatabaseInformation({
        streak: response.data.user.streak || 0,
        manaBalance: response.data.user.manaBalance || 0,
      });
      if (response.data.farcasterAccount) {
        setFarcasterUser(response.data.farcasterAccount);
      }
      setRefreshUsersStateLoading(false);
    } catch (error) {
      console.log("there was an error refreshing the users state", error);
      setRefreshUsersStateLoading(false);
    }
  }

  function getComponentForRoute(route, router) {
    if (!ready || loading) return;

    switch (route) {
      case "/":
        return (
          <LandingPage
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
          />
        );
      case "/write":
        if (!router.isReady) return null;
        if (router.query.p == undefined || !router.query.p.length > 0)
          return (
            <DesktopWritingGame
              ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
                ankyverseToday.wink
              } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
              userPrompt={thisIsThePrompt || ankyverseQuestion}
              setUserAppInformation={setUserAppInformation}
              userAppInformation={userAppInformation}
              setLifeBarLength={setLifeBarLength}
              setThisIsTheFlag={setThisIsTheFlag}
              lifeBarLength={lifeBarLength}
              text={text}
              setText={setText}
              setDisableButton={setDisableButton}
              setDisplayNavbar={setDisplayNavbar}
              displayWritingGameLanding={displayWritingGameLanding}
              setDisplayWritingGameLanding={setDisplayWritingGameLanding}
              farcasterUser={farcasterUser}
              countdownTarget={countdownTarget}
            />
          );
        let formattedPrompt = router.query.p.replaceAll("-", " ");
        if (!formattedPrompt) formattedPrompt = "tell us who you are";
        return (
          <DesktopWritingGame
            ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
              ankyverseToday.wink
            } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
            userPrompt={thisIsThePrompt || ankyverseQuestion}
            setUserAppInformation={setUserAppInformation}
            userAppInformation={userAppInformation}
            setLifeBarLength={setLifeBarLength}
            text={text}
            setText={setText}
            setDisplayNavbar={setDisplayNavbar}
            setThisIsTheFlag={setThisIsTheFlag}
            lifeBarLength={lifeBarLength}
            setDisableButton={setDisableButton}
            displayWritingGameLanding={displayWritingGameLanding}
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
            farcasterUser={farcasterUser}
            countdownTarget={countdownTarget}
          />
        );
      case "/welcome":
        return <WelcomePage text={text} />;
      case "/leaderboard":
        return <Leaderboard />;
      case "/bounty":
        return (
          <BountyPage
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
          />
        );
      case "/farcaster":
        return (
          <FarcasterPage
            setCountdownTarget={setCountdownTarget}
            countdownTarget={countdownTarget}
            setGameProps={setGameProps}
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
          />
        );
      case `/u/${route.split("/").pop()}`:
        return <UserDisplayPage thisUserInfo={router.query.fid} />;

      case "/farcaster/feed":
        return <FarcasterFeedPage router={router} />;
      case "/dashboard":
        return <DashboardPage router={router} />;
      case `/w/${route.split("/").pop()}`:
        if (thisIsTheFlag || !router.isReady) return null;
        if (
          router.query.prompt == undefined ||
          !router.query?.prompt?.length > 0
        )
          return (
            <DesktopWritingGame
              ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
                ankyverseToday.wink
              } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
              userPrompt={thisIsThePrompt || ankyverseQuestion}
              setUserAppInformation={setUserAppInformation}
              userAppInformation={userAppInformation}
              setLifeBarLength={setLifeBarLength}
              setThisIsTheFlag={setThisIsTheFlag}
              lifeBarLength={lifeBarLength}
              text={text}
              setText={setText}
              setDisableButton={setDisableButton}
              setDisplayNavbar={setDisplayNavbar}
              displayWritingGameLanding={displayWritingGameLanding}
              setDisplayWritingGameLanding={setDisplayWritingGameLanding}
              farcasterUser={farcasterUser}
              countdownTarget={countdownTarget}
            />
          );
        let formattedPrompt2 = router.query.prompt.replaceAll("-", " ");
        if (!formattedPrompt2) formattedPrompt = "";
        setThisIsThePrompt(formattedPrompt2);
        setDisplayWritingGameLanding(true);

      case "/what-is-this":
        return <WhatIsThisPage />;
      case "/mana":
        return <ManaPage />;
      case `/r/${route.split("/").pop()}`:
        return <ReadCastPage />;
      case `/i/${route.split("/").pop()}`:
        return <ReadIrysPage setShow={setShow} />;
      case `/cast/${route.split("/").pop()}`:
          return <ReadCastPage setShow={setShow} />;
      case `/feed-by-fid`:
        return <FeedByFidPage />;


      case "/irys":
        return <Irys />;
      case "/profile":
        return <ProfilePage />;

      case "/community-notebook":
        return <GlobalFeed thisWallet={wallet} />;
      case `/reply/${route.split("/").pop()}`:
        return (
          <DesktopWritingGame
            ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
              ankyverseToday.wink
            } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
            castWrapper={castWrapper}
            userPrompt={thisIsThePrompt || ankyverseQuestion}
            setUserAppInformation={setUserAppInformation}
            userAppInformation={userAppInformation}
            parentCastForReplying={parentCastForReplying}
            theAsyncCastToReply={theAsyncCastToReply}
            text={text}
            setText={setText}
            setLifeBarLength={setLifeBarLength}
            setThisIsTheFlag={setThisIsTheFlag}
            setDisplaySettingsModal={setDisplaySettingsModal}
            lifeBarLength={lifeBarLength}
            setDisplayNavbar={setDisplayNavbar}
            setDisableButton={setDisableButton}
            displayWritingGameLanding={displayWritingGameLanding}
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
            farcasterUser={farcasterUser}
            countdownTarget={countdownTarget}
          />
        );
      case "/feed":
        return <GlobalFeed thisWallet={wallet} />;
      case "/me":
        return <UserFeed exportWallet={exportWallet} thisWallet={wallet} />;

      case `/writing/${route.split("/").pop()}`:
        return <IndividualWritingDisplayPage />;
      case "/settings":
        return <SettingsPage />;

      case `/ask-farcaster`:
        return <AskFarcaster />;

      default:
        return (
          <DesktopWritingGame
            ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
              ankyverseToday.wink
            } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
            userPrompt={thisIsThePrompt || ankyverseQuestion}
            setUserAppInformation={setUserAppInformation}
            userAppInformation={userAppInformation}
            setLifeBarLength={setLifeBarLength}
            setThisIsTheFlag={setThisIsTheFlag}
            text={text}
            setText={setText}
            lifeBarLength={lifeBarLength}
            setDisableButton={setDisableButton}
            setDisplayNavbar={setDisplayNavbar}
            displayWritingGameLanding={displayWritingGameLanding}
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
            farcasterUser={farcasterUser}
            countdownTarget={countdownTarget}
          />
        );
    }
  }

  return (
    <div className="fixed overflow-y-scroll text-center w-screen text-white flex flex-col h-screen">
      <div className="standalone:mt-8 flex-none text-gray-400 w-full h-16 justify-between md:flex items-center flex-col">
        <div className=" h-12 items-center flex-row w-full bg-black px-2  cursor-pointer justify-between flex ">
          <div
            className="active:text-yellow-600 translate-y-2 md:translate-y-0 h-full md:mt-2  hover:text-purple-600"
            onClick={handleShow}
          >
            <MdMenuOpen size={40} />
          </div>
          <Link
            href="/"
            onClick={() => {
              setTheAsyncCastToReply(null);
              setDisplayWritingGameLanding(false);
            }}
            className={`${righteous.className} hover:text-purple-600 text-3xl`}
          >
            anky
          </Link>
          <div
            className="active:text-purple-600 md:mb-1 mt-1 hover:text-purple-600"
            onClick={() => {
              setTheAsyncCastToReply(null);
              setDisplayWritingGameLanding(true);
              setText("");
            }}
          >
            <FaPencilAlt size={30} />
          </div>
        </div>
        <div className="h-4 w-full">
          <div
            className="h-full opacity-80"
            style={{
              width: `${lifeBarLength}%`,
              backgroundColor: lifeBarLength > 30 ? "green" : "red",
            }}
          ></div>
        </div>
      </div>

      <div
        className={`${righteous.className} grow text-black relative  items-center justify-center`}
      >
        {displayWritingGameLanding ? (
          <div
            className="h-full"
            style={{
              backgroundImage:
                `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/blood1.jpg')`,
              backgroundColor: "black",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          >
            <DesktopWritingGame
              ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
                ankyverseToday.wink
              } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
              userPrompt={thisIsThePrompt || ankyverseQuestion}
              setUserAppInformation={setUserAppInformation}
              userAppInformation={userAppInformation}
              parentCastForReplying={parentCastForReplying}
              theAsyncCastToReply={theAsyncCastToReply}
              setLifeBarLength={setLifeBarLength}
              setThisIsTheFlag={setThisIsTheFlag}
              text={text}
              setText={setText}
              setDisplaySettingsModal={setDisplaySettingsModal}
              lifeBarLength={lifeBarLength}
              setDisplayNavbar={setDisplayNavbar}
              setDisableButton={setDisableButton}
              displayWritingGameLanding={displayWritingGameLanding}
              setDisplayWritingGameLanding={setDisplayWritingGameLanding}
              farcasterUser={farcasterUser}
              countdownTarget={countdownTarget}
            />
          </div>
        ) : (
          <div className="h-full">
            {getComponentForRoute(router.pathname, router)}
          </div>
        )}
      </div>

      {writingForDisplay && (
        <IndividualWritingDisplayModal
          writingForDisplay={writingForDisplay}
          setWritingForDisplay={setWritingForDisplay}
        />
      )}

      {displaySettingsModal && (
        <TimerSettingsModal
          displaySettingsModal={displaySettingsModal}
          setDisplaySettingsModal={setDisplaySettingsModal}
        />
      )}

      {displayAboutModal && (
        <AboutModal
          setDisplayAboutModal={setDisplayAboutModal}
          setDisplayWritingGameLanding={setDisplayWritingGameLanding}
        />
      )}
      {displayInstallPWA && (
        <InstallPwaModal setDisplayInstallPWA={setDisplayInstallPWA} />
      )}
      <Offcanvas
        className={`${righteous.className} bg-black text-gray-600`}
        placement="start"
        backdrop="true"
        scroll="false"
        show={show}
        onHide={handleClose}
      >
        <Offcanvas.Body>
          <div className="md:flex flex-col h-full w-fit relative">
            <Link href="/ask-farcaster" passHref>
              <small
                onClick={() => {
                  setDisplayWritingGameLanding(false);
                  handleClose();
                }}
                className="text-purple-600 hover:text-red-400 cursor-pointer absolute right-8 top-0"
              >
                <FaRegCircleQuestion size={24} />
              </small>
            </Link>

            <small
              onClick={() => {
                const thisCastLink = prompt(
                  "here, you can paste a warpcast url and reply to it writing through anky"
                );
                if (thisCastLink && thisCastLink.includes("0x")) {
                  fetchCastForReplyInformation(thisCastLink);
                  setParentCastForReplying(thisCastLink);
                  setDisplayWritingGameLanding(true);
                  handleClose();
                }
              }}
              className="text-red-600 hover:text-red-400 cursor-pointer absolute right-0 top-0"
            >
              <FaRegCommentDots size={24} />
            </small>
            <small
              onClick={handleClose}
              className="text-red-600 hover:text-red-400 cursor-pointer absolute left-0 top-0 text-lg"
            >
              <IoMdClose size={24} />
            </small>

            <div className={`mt-4 ${!authenticated ? "mb-2" : "mb-0"}`}>
              <p className="text-white text-2xl standalone:mt-12">
                welcome to anky
              </p>
              <small className="text-purple-300 text-xl">
                a meditation practice like no other
              </small>
            </div>
            <div className=" h-fit w-full ">
              {authenticated ? (
                <div className="flex flex-col h-full w-full items-start">
                  <div className="flex space-x-2">
                    <span className="rounded-xl text-xl hover:text-gray-600  mb-2  bg-purple-600 border-white border px-3 flex justify-center items-center space-x-2 my-3">
                      <div className="flex text-white hover:text-gray-500">
                        {userDatabaseInformation.manaBalance || 0}
                        <GiRollingEnergy
                          size={16}
                          color="white"
                          className="ml-2 translate-y-1.5"
                        />
                        <span className="mx-2">|</span>{" "}
                        {userDatabaseInformation.streak || 0}
                        <FaChartLine
                          size={16}
                          color="white"
                          className="ml-2 translate-y-1.5"
                        />
                      </div>
                    </span>
                    <span
                      onClick={refreshUsersState}
                      className="rounded-xl text-xl text-white mb-2 w-24 word-wrap overflow-x-hidden text-xs bg-green-600 border-white border px-3 flex justify-center items-center space-x-2 my-3 cursor-pointer hover:bg-green-700"
                    >
                      {refreshUsersStateLoading ? "refreshing..." : "refresh"}
                    </span>
                    <span
                      onClick={() => {
                        setDisplayWritingGameLanding(true);
                        handleClose();
                      }}
                      className="rounded-xl text-xl text-white mb-2  bg-orange-600 border-white border px-2 flex justify-center items-center space-x-2 my-3 cursor-pointer hover:bg-orange-700"
                    >
                      <FaPencilAlt size={16} />
                    </span>
                  </div>

                  <hr className="h-2 border-white border-2 bg-red-200" />
                  <div className="p-2 border border-white rounded-xl h-96  flex-col overflow-y-scroll text-white shadow-xl shadow-yellow-600 text-xl w-72 mb-12 mt-0">
                    {allUserWritings.map((writing, i) => {
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setTheAsyncCastToReply(null);
                            setDisplayWritingGameLanding(false);
                            handleClose();
                          }}
                          className="w-full text-nowrap odd:text-purple-400"
                        >
                          <Link
                            href={`/i/${writing.cid}`}
                            className="my-2 hover:cursor-pointer hover:text-purple-600 "
                          >
                            {writing.text}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="w-24 h-full">
                  <Button
                    buttonAction={login}
                    buttonText="login"
                    buttonColor="bg-purple-600 text-center text-white text-xl"
                  />
                </div>
              )}
            </div>
            <div className="w-full fixed text-white bottom-3">
              {authenticated && (
                <div className="flex flex-col mr-auto">
                  <small
                    onClick={copyWalletAddress}
                    className="text-sm hover:text-purple-200 active:text-purple-600 cursor-pointer"
                  >
                    {copyWalletAddressText}
                  </small>
                  {farcasterUser.username && (
                    <small className="text-sm mb-2">
                      Farcaster: @{farcasterUser.username}
                    </small>
                  )}
                </div>
              )}
              <p
                className="my-1 hover:text-purple-600 cursor-pointer"
                onClick={() => {
                  handleClose();
                  setDisplayAboutModal(!displayAboutModal);
                }}
              >
                About Anky
              </p>

              {authenticated && (
                <div className="h-12 mt-2 w-96   flex">
                  <div className=" h-12 w-12  rounded-xl overflow-hidden relative">
                    <Image
                      src={farcasterUser?.pfp || `/images/anky.png`}
                      fill
                    />
                  </div>
                  <div
                    onClick={handleClose}
                    className="flex py-1 px-3 items-center grow justify-between"
                  >
                    <Link
                      href={`/u/${user.id.split("did:privy:")[1]}`}
                      className="hover:text-purple-600 hover:cursor-pointer"
                      passHref
                    >
                      {farcasterUser.displayName}
                    </Link>
                    <Link
                      href="/settings"
                      className="hover:text-purple-600 cursor-pointer"
                    >
                      <span
                        onClick={() => {
                          setTheAsyncCastToReply(null);
                          setDisplayWritingGameLanding(false);
                          handleClose();
                        }}
                      >
                        · · ·
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default GlobalApp;
