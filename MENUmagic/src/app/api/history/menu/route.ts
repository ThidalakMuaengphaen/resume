// pages/api/history/menu.ts
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase"; // Adjust this import based on your Firebase setup
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { type NextRequest } from 'next/server'
 
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userID = searchParams.get('userID')
  
  if (!userID || typeof userID !== "string") {
    return Response.json({ error: "Missing or invalid userID" });
  }

  try {
    const menuRef = collection(db, "menuTable");
    const q = query(
      menuRef,
      where("userID", "==", userID),
      // orderBy("createdAt", "desc"), // Order by createdAt
      limit(5) // Limit results to 5
    );

    const querySnapshot = await getDocs(q);

    const menuHistoryData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const sortItem = sortByCreatedAtDesc(menuHistoryData)

    return Response.json(sortItem);
  } catch (error) {
    console.error("Error fetching menu data:", error);
    return Response.json({ error: "Internal Server Error" });
  }
}

function sortByCreatedAtDesc(data: any) {
  return data.sort((a: { createdAt: { seconds: number; nanoseconds: number; }; }, b: { createdAt: { seconds: number; nanoseconds: number; }; }) => {
    return (
      b.createdAt.seconds * 1000 + Math.floor(b.createdAt.nanoseconds / 1_000_000) -
      (a.createdAt.seconds * 1000 + Math.floor(a.createdAt.nanoseconds / 1_000_000))
    );
  });
}