import React, { useState, useRef, useEffect } from "react";
import { Righteous } from "next/font/google";
import Button from "./Button";
import Image from "next/image";
import { WebIrys } from "@irys/sdk";
import { useWallets } from "@privy-io/react-auth";
import { saveTextAnon } from "../lib/backend";
import { ethers } from "ethers";
import { setUserData } from "../lib/idbHelper";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import LoggedInUser from "./LoggedInUser";
import { useRouter } from "next/router";
import { BsArrowRepeat } from "react-icons/bs";
import { FaRegCommentAlt, FaRegHeart } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import buildersABI from "../lib/buildersABI.json";
import { encodeToAnkyverseLanguage } from "../lib/ankyverse";

import { usePrivy } from "@privy-io/react-auth";
import Spinner from "./Spinner";
import { useUser } from "../context/UserContext";
import { useSettings } from "../context/SettingsContext";
import IndividualDecodedCastCard from "./farcaster/IndividualDecodedCastCard";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const righteous = Righteous({ weight: "400", subsets: ["latin"] });

const DesktopWritingGame = ({
  theAsyncCastToReply = null,
  userPrompt,
  setLifeBarLength,
  setLoadButtons,
  ankyverseDate,
  gamePrompts = {},
  setDisableButton,
  castWrapper = null,
  setUserAppInformation,
  setThisIsTheFlag,
  userAppInformation,
  parentCastForReplying,
  setDisplayNavbar,
  setDisplayWritingGameLanding,
  displayWritingGameLanding,
  setDisplaySettingsModal,
  lifeBarLength,
  farcasterUser,
  countdownTarget,
  text,
  setText,
}) => {
  const mappedUserJournals =
    [] || userAppInformation?.userJournals?.map((x) => x.title);
  const router = useRouter();
  const { login, authenticated, user, getAccessToken, sendTransaction } =
    usePrivy();
  const { userSettings } = useSettings();
  const [textareaHeight, setTextareaHeight] = useState("20vh"); // default height
  const { setUserDatabaseInformation, setAllUserWritings } = useUser();
  const audioRef = useRef();
  const [amountOfManaAdded, setAmountOfManaAdded] = useState(0);
  const [time, setTime] = useState(countdownTarget || 0);
  const [whatIsThis, setWhatIsThis] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [randomUUID, setRandomUUID] = useState("");
  const [savingRoundLoading, setSavingRoundLoading] = useState(false);
  const [userWantsFeedbackFromAnky, setUserWantsFeedbackFromAnky] =
    useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [userWantsToCastAnon, setUserWantsToCastAnon] = useState(true);
  const [savingRound, setSavingRound] = useState(false);
  const [castAs, setCastAs] = useState("");
  const [castForPreview, setCastForPreview] = useState(null);
  const [userWantsToStoreWritingForever, setUserWantsToStoreWritingForever] =
    useState(true);
  const [thereWasAnError, setThereWasAnError] = useState(false);
  const [moreThanMinRun, setMoreThanMinRound] = useState(null);
  const [savingTextAnon, setSavingTextAnon] = useState(false);
  const [savedText, setSavedText] = useState(false);
  const [cid, setCid] = useState("");
  const [sessionIsOver, setSessionIsOver] = useState(false);
  const [previewCast, setPreviewCast] = useState(false);
  const [userWantsToEncryptWriting, setUserWantsToEncryptWriting] =
    useState(false);
  const [everythingWasUploaded, setEverythingWasUploaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(!authenticated);
  const [savedToDb, setSavedToDb] = useState(false);
  const [lastKeystroke, setLastKeystroke] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [errorProblem, setErrorProblem] = useState(false);
  const [castHash, setCastHash] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [savingSessionState, setSavingSessionState] = useState(false);
  const [failureMessage, setFailureMessage] = useState("");
  const [journalIdToSave, setJournalIdToSave] = useState("");
  const [missionAccomplished, setMissionAccomplished] = useState(false);
  const [responseFromPinging, setResponseFromPinging] = useState("");
  const [copyText, setCopyText] = useState("copy my writing");
  const [hardcoreContinue, setHardcoreContinue] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const { wallets } = useWallets();

  const textareaRef = useRef(null);
  const intervalRef = useRef(null);
  const keystrokeIntervalRef = useRef(null);
  const thisWallet = wallets[0];

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const handleResize = () => {
    if (isKeyboardOpen) {
      // Adjust the height of the textarea when the keyboard is open
      const availableHeight = window.innerHeight;
      if (textareaRef.current) {
        textareaRef.current.style.height = `${availableHeight * 0.6}px`; // Adjust the 0.6 (60%) as necessary
      }
    } else {
      // Reset the height of the textarea when the keyboard is closed
      if (textareaRef.current) {
        textareaRef.current.style.height = "64px"; // Reset to default height or any other value as needed
      }
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isKeyboardOpen]);

  useEffect(() => {
    if (isActive && !isDone) {
      if (countdownTarget > 0) {
        intervalRef.current = setInterval(() => {
          setTime((time) => +time - 1);
          if (time < 1) {
            setTime(countdownTarget);
            setFinished(true);
            setMissionAccomplished(true);
            setIsActive(false);
          }
        }, 1000);
      } else {
        intervalRef.current = setInterval(() => {
          setTime((time) => +time + 1);
        }, 1000);
      }
    } else if ((countdownTarget > 0 && time === 0) || (!isActive && !isDone)) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, time, isDone]);

  useEffect(() => {
    if (isActive) {
      keystrokeIntervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - lastKeystroke;
        if (time === 480) {
          // audioRef.current.play();
        }
        if (
          elapsedTime > userSettings.secondsBetweenKeystrokes * 1000 &&
          !isDone
        ) {
          finishRun();
        } else {
          // calculate life bar length
          const newLifeBarLength =
            100 - elapsedTime / (10 * userSettings.secondsBetweenKeystrokes); // 100% - (elapsed time in seconds * (100 / 3))
          setLifeBarLength(Math.max(newLifeBarLength, 0)); // do not allow negative values
        }
      }, 100);
    } else {
      clearInterval(keystrokeIntervalRef.current);
    }

    return () => clearInterval(keystrokeIntervalRef.current);
  }, [isActive, lastKeystroke]);

  const resetKeyboardState = () => {
    setIsKeyboardOpen(false);
    handleResize();
  };

  const finishRun = async () => {
    try {
      const finishTimestamp = Date.now();
      if (countdownTarget === 0) setMissionAccomplished(true);
      setSessionIsOver(true);
      setLifeBarLength(0);
      setFinished(true);
      setEndTime(finishTimestamp);
      setIsDone(true);
      setIsActive(false);
      clearInterval(intervalRef.current);
      clearInterval(keystrokeIntervalRef.current);
      await navigator.clipboard.writeText(text);
      setMoreThanMinRound(true);
      setFailureMessage(`You're done! This run lasted ${time}.}`);
      const frontendWrittenTime = Math.floor(
        (finishTimestamp - startTime) / 1000
      );
      console.log("inside the finish run thing", frontendWrittenTime);

      if (frontendWrittenTime > 30 && authenticated) {
        pingServerToEndWritingSession(finishTimestamp, frontendWrittenTime);
      }
    } catch (error) {
      console.log("there was an error", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyText("copied");
    } catch (error) {
      console.log("there was an error copying this");
    }
  };

  const startNewRun = () => {
    try {
      audioRef.current.pause();
      setTime(0);
      setDisableButton(false);
      setLifeBarLength(100);
      setText("");
      setSavingRound(false);
      setSavedToDb(false);
      setIsDone(false);
      setFinished(false);
      setSavedText(false);
      copyToClipboard();
      setCopyText("Copy my writing");
    } catch (error) {
      console.log("there was an error in the start new run function");
    }
  };

  const startNewCountdownRun = () => {
    try {
      audioRef.current.pause();
      setCopyText("Copy my writing");
      setTime(countdownTarget);
      setDisableButton(false);
      setLifeBarLength(100);
      setText("");
      // setSavingRound(false);
      // setSavedToDb(false);
      setIsDone(false);
      setFinished(false);
      // setSavedText(false);
      copyToClipboard();
    } catch (error) {
      console.log("there was an error");
    }
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
    const now = Date.now();
    if (!isActive && event.target.value.length > 0) {
      setDisableButton(true);
      setDisplayNavbar(false);
      setIsActive(true);
      setFailureMessage("");
      setStartTime(now);
      if (authenticated) {
        pingServerToStartWritingSession(now);
      }
    }
    if (!text && event.target.value.length > 0) {
      setIsKeyboardOpen(true);
    }
    setLastKeystroke(now);
  };

  async function pingServerToStartWritingSession(now) {
    try {
      let response;
      if (authenticated) {
        const authToken = await getAccessToken();
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/mana/session-start`,
          {
            timestamp: now,
            user: user.id.replace("did:privy:", ""),
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
      } else {
        const newRandomUUID = uuidv4();
        setRandomUUID(newRandomUUID);
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/mana/anon-session-start`,
          {
            timestamp: now,
            randomUUID: newRandomUUID,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.log("there was an error requesting to ping the serve", error);
    }
  }

  async function pingServerToEndWritingSession(now, frontendWrittenTime) {
    try {
      let response;
      if (authenticated) {
        const authToken = await getAccessToken();
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/mana/session-end`,
          {
            timestamp: now,
            user: user.id.replace("did:privy:", ""),
            frontendWrittenTime,
            dataForCalculatingMultiplier: {
              amountOfKeystrokes: "",
              keystrokesPerMinute: "",
              backkeystrokes: "",
              newenMultiplierFromSpeed: 1,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/mana/anon-session-end`,
          {
            timestamp: now,
            randomUUID: randomUUID,
            frontendWrittenTime,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      setAmountOfManaAdded(frontendWrittenTime);
      setResponseFromPinging(response.data.message);
      setUserDatabaseInformation((x) => {
        return {
          ...x,
          manaBalance: response.data.data.manaBalance,
          streak: response.data.data.activeStreak,
        };
      });
    } catch (error) {
      console.log("there was an error pinging the server here.", error);
    }
  }

  const pasteText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyText("copied.");
    } catch (error) {
      console.log("there was an error copying the text.");
    }
  };

  const sendTextToIrys = async () => {
    if (!authenticated) {
      if (confirm("You need to login to save your writings")) {
        return login();
      }
      return router.push("/what-is-this");
    }
    setSavingTextAnon(true);
    const getWebIrys = async () => {
      if (!thisWallet) return;
      const url = "https://node2.irys.xyz";
      const token = "ethereum";
      const rpcURL = "";

      const provider = await thisWallet.getEthersProvider();
      if (!provider) throw new Error(`Cannot find privy wallet`);

      const irysWallet =
        thisWallet?.walletClientType === "privy"
          ? { name: "privy-embedded", provider, sendTransaction }
          : { name: "privy", provider };

      const webIrys = new WebIrys({ url, token, wallet: irysWallet });
      await webIrys.ready();
      return webIrys;
    };
    const webIrys = await getWebIrys();
    let previousPageCid = 0;
    previousPageCid = "";

    const tags = [
      { name: "Content-Type", value: "text/plain" },
      { name: "application-id", value: "Anky Dementors" },
      { name: "container-type", value: "community-notebook" },
    ];
    try {
      const receipt = await webIrys.upload(text, { tags });
      return receipt;
    } catch (error) {
      console.log("there was an error");
      console.log("the error is:", error);
      // setDisplayWritingGameLanding(false);
    }
  };

  const handleCast = async (cid) => {
    console.log("in here, the farcaster user is: ", farcasterUser);
    if (!text) return alert("please write something");
    console.log("inside the handleCast route", cid, parentCastForReplying);
    setIsCasting(true);
    try {
      let forEmbedding = [{ url: `https://www.anky.bot/i/${cid || cid.id}` }];

      const newCastText = text.length > 1000 ? `${text.slice(0, 1000)}...` : text;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/api/cast`,
        {
          text: newCastText,
          signer_uuid: farcasterUser.signerUuid,
          embeds: forEmbedding,
          parent:
            parentCastForReplying || "https://warpcast.com/~/channel/anky",
          cid: cid,
          manaEarned: amountOfManaAdded,
        }
      );

      if (response.status === 200) {
        setCastHash(response.data.cast.hash);
        return response.data.cast;
      }
    } catch (error) {
      setIsCasting(false);
      console.error("Could not send the cast", error);
    }
  };

  async function saveTextToJournal() {
    const chosenJournal = userAppInformation.userJournals.filter(
      (x) => x.journalId == journalIdToSave
    )[0];
    const getWebIrys = async () => {
      if (!thisWallet) return;
      const url = "https://node2.irys.xyz";
      const token = "ethereum";
      const rpcURL = "";

      const provider = await thisWallet.getEthersProvider();
      if (!provider) throw new Error(`Cannot find privy wallet`);

      const irysWallet =
        thisWallet?.walletClientType === "privy"
          ? { name: "privy-embedded", provider, sendTransaction }
          : { name: "privy", provider };

      const webIrys = new WebIrys({ url, token, wallet: irysWallet });
      await webIrys.ready();
      return webIrys;
    };
    const webIrys = await getWebIrys();
    let previousPageCid = 0;
    if (chosenJournal.entries.length > 0) {
      previousPageCid =
        chosenJournal.entries[chosenJournal.entries.length - 1].cid;
    }
    const tags = [
      { name: "Content-Type", value: "text/plain" },
      { name: "application-id", value: "Anky Dementors" },
      { name: "container-type", value: "journal" },
      { name: "container-id", value: journalIdToSave },
      { name: "page-number", value: chosenJournal.entries.length.toString() },
      {
        name: "smart-contract-address",
        value: process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
      },
      {
        name: "previous-page",
        value: previousPageCid.toString(),
      },
    ];
    try {
      const receipt = await webIrys.upload(text, { tags });
      let newJournalEntry;
      setUserAppInformation((x) => {
        // Find the specific journal index by its id
        const journalIndex = x.userJournals.findIndex(
          (j) => j.journalId == journalIdToSave
        );

        newJournalEntry = {
          text: text,
          timestamp: new Date().getTime(),
          pageNumber: chosenJournal.entries.length,
          previousPageCid: previousPageCid,
          cid: receipt.id,
        };

        const updatedJournal = {
          ...x.userJournals[journalIndex],
          entries: [...x.userJournals[journalIndex].entries, newJournalEntry],
        };

        const updatedUserJournals = [
          ...x.userJournals.slice(0, journalIndex),
          updatedJournal,
          ...x.userJournals.slice(journalIndex + 1),
        ];

        setUserData("userJournals", updatedUserJournals);

        return {
          ...x,
          userJournals: updatedUserJournals,
        };
      });
      return receipt;
    } catch (e) {
      console.log("Error uploading data ", e);
    }
  }

  const handleAnonCast = async (irysResponseCid = null) => {
    try {
      console.log("handle anon response")
      setIsCasting(true);
      let responseFromIrys, cid;
      if (!authenticated) setSavingRoundLoading(true);
  
      // const kannadaCid = encodeToAnkyverseLanguage(cid);
      // const newCastText = `${kannadaCid}\n\nwritten through anky. you can decode this clicking on the embed on the next cast.`;


      let forReplyingVariable = "https://warpcast.com/~/channel/anky";
      if (theAsyncCastToReply) {
        forReplyingVariable = theAsyncCastToReply.hash;
      } else if (parentCastForReplying) {
        forReplyingVariable = parentCastForReplying;
      }
      let bloodId = ""
      if(router?.query?.bloodId ){
        bloodId = router?.query?.bloodId
      }
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/cast-anon-writing`,
        {
          time,
          cid,
          manaEarned: amountOfManaAdded,
          text: text,
          parent: forReplyingVariable,
          bloodId
        }
      );
      console.log("the repsonse here is: ", response.data)

      setCastHash(response.data.cast.hash);
      return {
        castHash: response.data.cast.hash,
        responseFromIrys: response.data.cid,
      };
    } catch (error) {
      alert("there was an error casting your cast anon");
      console.log(error);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
  };

  const previewCastAction = async () => {
    try {
      const anonCastPreview = {
        author: {
          active_status: "inactive",
          custody_address: "0x3ae59405ea68e9ce61442cadf74c335abfbc6b60",
          display_name: "Anky",
          fid: 18350,
          pfp_url: "https://i.imgur.com/PPYWuJU.jpg",
          username: "anky",
        },
        hash: "0x398492dsjcasc",
        text: text,
        reactions: {
          likes: [2, 3, 5, 1, 51, 6],
          recasts: [2, 2, 4, 5, 2, 2, 4, 5, 6, 1, 2, 2],
        },
        replies: { count: 8 },
        root_parent_url: "https://warpcast.com/~/channel/anky",
        timestamp: new Date(),
      };
      setCastForPreview(anonCastPreview);
      setPreviewCast(true);
    } catch (error) {
      console.log("there was an error previewing your cast.");
    }
  };

  async function handleSaveSession() {
    try {
      let castResponse, irysResponseCid, irysResponseReceipt, responseFromIrys;

      setSavingSessionState(true);
      if (authenticated) {
        irysResponseReceipt = await sendTextToIrys();
        irysResponseCid = irysResponseReceipt.id;
      }
      if (!authenticated) {
        if (userWantsToCastAnon) {
          castResponse = await handleAnonCast();
          console.log('THE CAST RESPONSE IS: ', castResponse)
        } else {
          setDisplayWritingGameLanding(false);
          return router.push("/welcome");
        }
      }
      if (authenticated && farcasterUser.signerStatus != "approved") {
        if (userWantsToCastAnon) { 
          castResponse = await handleAnonCast(irysResponseCid)
        };

        setAllUserWritings((x) => [
          { cid: irysResponseCid, text: text, timestamp: new Date().getTime() },
          ...x,
        ]);
      }
      if (
        (authenticated && farcasterUser.signerStatus == "approved") ||
        (authenticated && farcasterUser.status == "approved")
      ) {
        if (castAs == "me") {
          castResponse = await handleCast(irysResponseCid);
        } else if (castAs == "anon") {
          castResponse = await handleAnonCast();
        }
        setAllUserWritings((x) => [
          { cid: irysResponseCid, text: text, timestamp: new Date().getTime() },
          ...x,
        ]);
      }
      console.log('THE CAST RESPONSE IS: ', castResponse)

      setDisplayWritingGameLanding(false);
      router.push(`/i/${castResponse?.responseFromIrys || irysResponseCid}?castHash=${castResponse.castHash}`);
    } catch (error) {
      console.log(
        "There was an error in the handle finish session function",
        error
      );
    }
  }

  function renderSessionIsOver() {
    return (
      <div
        className={`${
          text && "fade-in"
        } flex flex-col justify-center items-center absolute w-screen top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-opacity-20 mb-4`}
      >
        <div className="border-white border-2 mx-16 md:mx-auto w-5/6 md:w-2/3 xl:w-2/5 rounded-xl bg-black p-2 text-white">
          {/* {time < 30 ? (
            <p className="text-red-400 text-md">
              *maybe that was a bit fast. the interface recognizes when you
              write, and for now, it is set to end your session after{" "}
              {userSettings.secondsBetweenKeystrokes} seconds. you can change
              that by clicking{" "}
              <span
                onClick={() => {
                  setDisplaySettingsModal(true);
                }}
                className="text-purple-500 hover:text-yellow-600 cursor-pointer"
              >
                HERE
              </span>
            </p>
          ) : (
            <p className="text-red-400 text-sm">
              {!authenticated
                ? "you need to be logged in to earn $newen"
                : responseFromPinging}
            </p>
          )} */}

          {/* {authenticated && (
            <div className=" bg-purple-600 p-2 mt-2 mb-0 w-full rounded-xl mx-auto flex flex-col justify-start items-center ">
              <div className="flex">
                <p className="text-black h-fit flex items-center">
                  do you want to save your writing forever (associated with your
                  wallet address)
                </p>
                <input
                  className="mx-4 my-auto"
                  type="checkbox"
                  onChange={(e) => {
                    setUserWantsToStoreWritingForever(
                      !userWantsToStoreWritingForever
                    );
                  }}
                  checked={userWantsToStoreWritingForever}
                />
              </div>

              {userWantsToStoreWritingForever &&
                authenticated &&
                userAppInformation.userJournal && (
                  <div className="flex bg-purple-500 p-2 mt-2 rounded-xl">
                    <div className="bg-purple-500 text-black px-2 my-2 rounded-xl w-full flex space-x-2 items-center justify-center">
                      <p>save to journal? </p>
                      {userAppInformation.userJournals &&
                        userAppInformation.userJournals.length > 0 && (
                          <div>
                            <select
                              onChange={(e) => {
                                console.log("in here", e.target.value);
                                setJournalIdToSave(e.target.value);
                              }}
                              className="p-2 text-black rounded-xl my-2"
                            >
                              <option value="">
                                don&apos;t save to journal
                              </option>
                              {userAppInformation.userJournals.map((x, i) => {
                                return (
                                  <option key={i} value={x.journalId}>
                                    {x.title}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        )}
                    </div>
                  </div>
                )}
            </div>
          )} */}

          <div className="flex justify-center mt-4">
            <Button
              buttonText={
                savingSessionState
                  ? "broadcasting..."
                  : userWantsToCastAnon
                  ? "cast anon"
                  : "finish session"
              }
              buttonAction={handleSaveSession}
              buttonColor="bg-green-600"
            />
            <Button
              buttonText={"copy & close"}
              buttonAction={() => {
                copyToClipboard()
                setDisplayWritingGameLanding(false);
              }}
              buttonColor="bg-red-600"
            />
          </div>
        </div>
      </div>
    );
  }

  if (errorProblem)
    return (
      <div
        className={`${righteous.className} text-white relative flex flex-col items-center justify-center w-full bg-cover bg-center`}
        style={{
          boxSizing: "border-box",
          height: "calc(100vh)",
          backgroundImage: "url('/images/the-monumental-game.jpeg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <p>
          There was an error. But you can always keep your writing if you want.
        </p>
        <p>I&apos;m sorry. I&apos;m doing my best to make this thing work.</p>
        <Button
          buttonColor="bg-thegreenbtn"
          buttonAction={pasteText}
          buttonText={copyText}
        />
      </div>
    );

  if (savingTextAnon)
    return (
      <div>
        <p>loading...</p>
        <Spinner />
      </div>
    );

  if (thereWasAnError) {
    return (
      <div className="text-white">
        <p>there was an error uploading your text</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <audio ref={audioRef}>
        <source src="/sounds/bell.mp3" />
      </audio>
      <div className="md:block text-white relative w-full h-full mx-auto">
        <div className="flex h-full flex-col">
          <div
            className={`${righteous.className} w-full grow-0 bg-black/50 py-2 justify-center items-center flex h-fit items-center px-2 flex `}
          >
            <div
              className={`text-left h-fit w-10/12 text-purple-600 md:mt-0 text-xl md:text-3xl overflow-y-scroll  drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]`}
            >
              {theAsyncCastToReply ? (
                <div className="flex h-32">
                  <div className="h-30 p-2">
                    <div className="h-5/6 mx-auto flex justify-center items-center rounded-full overflow-hidden aspect-square relative">
                      <Image src={theAsyncCastToReply.author.pfp_url} fill />
                    </div>
                    <div>
                      <div className="flex space-x-4 h-full text-lg">
                        <div
                          className={`flex space-x-1 items-center  hover:text-gray-500 cursor-pointer`}
                        >
                          <FaRegCommentAlt />
                          <span>{theAsyncCastToReply.replies.count}</span>
                        </div>
                        <div
                          className={`flex space-x-1 items-center  hover:text-green-300 cursor-pointer`}
                        >
                          <BsArrowRepeat size={19} />
                          <span>
                            {theAsyncCastToReply.reactions.recasts.length}
                          </span>
                        </div>
                        <div
                          className={`flex space-x-1 items-center hover:text-red-500 cursor-pointer`}
                        >
                          <FaRegHeart />
                          <span>
                            {theAsyncCastToReply.reactions.likes.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 w-full flex flex-col justify-between h-full  text-lg">
                    <div className="w-full overflow-y-scroll">
                      {theAsyncCastToReply.text.includes("\n") ? (
                        theAsyncCastToReply.text.split("\n").map((x, i) => (
                          <p className="" key={i}>
                            {x}
                          </p>
                        ))
                      ) : (
                        <p className="my-2">{theAsyncCastToReply.text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                userPrompt
              )}
            </div>
            <div className="w-2/12 text-4xl md:text-6xl text-yellow-600 h-full flex relative items-center justify-center ">
              {time}
              {time === 0 && (
                <span
                  onClick={() => setDisplaySettingsModal(true)}
                  className="text-sm absolute bottom-0 right-0 text-red-600 hover:text-red-400 cursor-pointer"
                >
                  <IoSettings size={22} />
                </span>
              )}
            </div>
          </div>

          <div className="w-full grow relative">
            <textarea
              ref={textareaRef}
              disabled={finished}
              onPaste={handlePaste}
              style={{
                transition: "top 1s, bottom 1s, left 1s, right 1s", // smooth transition
                position: text ? "absolute" : "static", // use absolute positioning only when text is present
                top: text ? "0" : "",
                bottom: text ? "0" : "",
                left: text ? "0" : "",
                right: text ? "0" : "",
              }}
              className={`${
                text ? "w-full h-full text-left" : "mt-8 w-4/5 md:w-3/5 h-96"
              } p-2 text-white opacity-80 placeholder-white text-xl border placeholder:text-gray-300 border-white rounded-md bg-opacity-10 bg-black`}
              placeholder={
                theAsyncCastToReply ? "reply here..." : "write here..."
              }
              value={text}
              onChange={handleTextChange}
            ></textarea>
            {text.length > 0 ||
              (!finished && (
                <div>
                  <div className="flex w-48 justify-center mx-auto mt-4">
                    <Button
                      buttonText="cancel"
                      buttonColor="bg-red-600"
                      buttonAction={() => {
                        setThisIsTheFlag(true);
                        if (displayWritingGameLanding) {
                          if (router.pathname.includes("/u/")) {
                            return setDisplayWritingGameLanding(false);
                          }
                          if (router.pathname.includes("/i/")) {
                            return setDisplayWritingGameLanding(false);
                          }
                          if (
                            router.pathname.includes("write") ||
                            router.pathname.includes("w")
                          ) {
                            router.push("/");
                          }
                          setDisplayWritingGameLanding(false);
                        } else {
                          if (
                            router.pathname.includes("write") ||
                            router.pathname.includes("w")
                          )
                            return router.push("/");
                          setDisplayWritingGameLanding(false);
                          router.push("/");
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
          {sessionIsOver && renderSessionIsOver()}
        </div>
      </div>

      <Overlay show={previewCast}>
        <div className="bg-black bg-opacity-60 flex flex-col h-full justify-around items-around w-full ">
          <div>
            <IndividualDecodedCastCard
              cast={castForPreview}
              previewCast={true}
              farcasterUser={{}}
            />
            <div className="flex mt-0 justify-between px-4 mx-auto w-96">
              <Button
                buttonText={"go back"}
                buttonAction={() => setPreviewCast(false)}
                buttonColor="bg-purple-600 w-32"
              />
            </div>
          </div>
        </div>
      </Overlay>
      {/* <Overlay show={showOverlay && !authenticated && !farcasterUser?.fid}>
        <div className="flex flex-col h-full justify-center items-center w-full ">
          <div className="flex flex-col text-white h-48">
            <p>you are not logged in</p>
            <p>you won&apos;t be able to store your writings forever</p>
            <div className="flex justify-center">
              <Button
                buttonAction={login}
                buttonText="log in"
                buttonColor="bg-green-600 mx-auto w-fit my-2"
              />
              <Button
                buttonAction={() => {
                  setShowOverlay(false);
                  setHardcoreContinue(true);
                }}
                buttonText="continue anon"
                buttonColor="bg-purple-600 mx-auto w-fit my-2"
              />
            </div>
            <p
              onClick={() => setWhatIsThis(!whatIsThis)}
              className={`small  ${
                whatIsThis ? "text-purple-400" : "text-gray-300"
              } hover:text-purple-400 cursor-pointer mb-2`}
            >
              what is this?
            </p>
            {whatIsThis && (
              <div>
                <p className="small text-white mb-2">just write</p>
                <p className="small text-white">it is all an excuse</p>
              </div>
            )}
          </div>
        </div>
      </Overlay> */}
    </div>
  );
};

const Overlay = ({ show, children }) => {
  if (!show) return null;

  return (
    <div className="fixed top-0 h-screen w-screen left-0 right-0 bottom-0 bg-black bg-opacity-60 z-40">
      {children}
    </div>
  );
};

export default DesktopWritingGame;
