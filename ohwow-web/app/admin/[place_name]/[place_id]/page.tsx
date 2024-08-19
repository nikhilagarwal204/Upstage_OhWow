import axios from 'axios'
import AdminPlayer from '../../../components/adminPlayer'
import type { Metadata } from 'next'

type Props = {
  params: { place_id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await axios.get(`https://ohwow-audio-gmviuexllq-uc.a.run.app/admin/get/${params.place_id}`);
    return {
      title: `${response.data.name} - Oh Wow!`,
      openGraph: {
        images: [response.data.cover],
      },
    }
  } catch (error) {
    console.log("Error fetching metadata");
    return {
      title: "Invalid Place URL",
    }
  }
}

export default function AdminPlacePage({ params }: Props) {
  return (
    <AdminPlayer placeId={params.place_id} />
  )
}