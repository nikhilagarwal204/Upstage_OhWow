import axios from 'axios'
import Player from '../../../components/player'
import type { Metadata } from 'next'

type Props = {
  params: { short_id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await axios.post(`https://ohwow-backend-gmviuexllq-uc.a.run.app/v2/placeinfo`, {
      "short_id": [params.short_id]
    });
    return {
      title: `Oh Wow Story - ${response.data[0].name}`,
      openGraph: {
        images: [response.data[0].image_url],
      },
    }
  } catch (error) {
    console.log("Error fetching metadata");
    return {
      title: "Invalid Place URL",
    }
  }
}

export default function PlacesPage({ params }: Props) {
  return (
    <Player shortId={params.short_id} />
  )
}
