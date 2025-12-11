'use client'

import React, { useState, useEffect } from 'react'
import { Play, Trash2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Video {
  _id: string
  title: string
  url: string
  createdAt: string
}

export default function VideoListView() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/videos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setVideos(data)
    } catch (error) {
      console.error('获取视频列表失败:', error)
    }
  }

  const deleteVideo = async (id: string) => {
    if (!confirm('确定要删除这个视频吗?')) return

    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/api/videos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchVideos()
    } catch (error) {
      console.error('删除视频失败:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <Play className="w-16 h-16 text-gray-400" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
            <p className="text-sm text-gray-500 mb-4 truncate">{video.url}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {new Date(video.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => deleteVideo(video._id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
