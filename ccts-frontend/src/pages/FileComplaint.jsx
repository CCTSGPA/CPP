import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import MainLayout from "../layouts/MainLayout";
import { uploadFile, submitComplaint } from "../services/complaintsService";
import { getCurrentPosition, reverseGeocodeDebounced } from "../services/locationService";

const schema = z.object({
  title: z.string().min(5, "Please enter a short title"),
  department: z.string().min(2, "Choose a department"),
  description: z.string().min(20, "Provide details (at least 20 characters)"),
  location: z.string().optional(),
});

export default function FileComplaint() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ resolver: zodResolver(schema) });

  const [cameraImage, setCameraImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [locationStatus, setLocationStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isCapturingImage, setIsCapturingImage] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Get user's geolocation + reverse geocode
  const getLocation = async () => {
    setIsGettingLocation(true);
    setLocationStatus({ type: "", message: "" });

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude, accuracy } = position.coords;

      const geocodeResponse = await reverseGeocodeDebounced(latitude, longitude);
      const geo = geocodeResponse?.data || {};

      const computedAddress =
        geo.displayAddress ||
        [geo.area, geo.city, geo.state, geo.pincode].filter(Boolean).join(", ") ||
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setLocationDetails({
        latitude,
        longitude,
        accuracy,
        city: geo.city || "",
        area: geo.area || "",
        state: geo.state || "",
        pincode: geo.pincode || "",
        displayAddress: computedAddress,
      });

      setValue("location", computedAddress, { shouldValidate: true });
      setLocationStatus({ type: "success", message: "Location detected and fields auto-filled." });
    } catch (error) {
      if (error.message === "Previous location request superseded by a newer request.") {
        return;
      }
      setLocationStatus({
        type: "error",
        message: error?.response?.data?.message || error.message || "Unable to retrieve location.",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      setIsCapturingImage(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prefer back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please check permissions.");
      setIsCapturingImage(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturingImage(false);
  };

  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCameraImage(imageDataUrl);
    setImagePreview(imageDataUrl);
    stopCamera();
  };

  // Handle file input change
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setCameraImage(file); // Store the actual file object for upload
    }
  };

  // Upload evidence and get URL
  const uploadEvidence = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadFile(file);
      return response.data.url; // Return the URL of the uploaded file
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let evidenceUrl = null;

      const incidentDate = new Date().toISOString().slice(0, 19);

      // Upload image if captured/selected
      if (cameraImage && cameraImage instanceof File) {
        evidenceUrl = await uploadEvidence(cameraImage);
      }

      // Prepare complaint data
      const complaintData = {
        title: data.title,
        description: data.description,
        category: data.department,
        location: data.location || locationDetails?.displayAddress || "",
        latitude: locationDetails?.latitude,
        longitude: locationDetails?.longitude,
        accuracy: locationDetails?.accuracy,
        incidentDate,
        evidenceUrl: evidenceUrl,
        respondentName: "",
        respondentDesignation: "",
        respondentDepartment: "",
      };

      const response = await submitComplaint(complaintData);
      
      if (response.status === "success") {
        alert(
          `Complaint submitted successfully!\nTracking Number: ${response.data.trackingNumber}`
        );
        reset();
        setCameraImage(null);
        setImagePreview(null);
        setLocationDetails(null);
        setLocationStatus({ type: "", message: "" });
      } else {
        alert("Failed to submit complaint: " + response.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An error occurred while submitting the complaint. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="header-title">File a Complaint</h1>
        <p className="subtle mt-1">
          Use this form to submit allegations. Provide accurate details to help
          the investigation. You can capture photos and location automatically.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <div className="card">
            <h3 className="font-semibold">Complaint Details</h3>
            <div className="mt-3 grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm">Title *</label>
                <input
                  {...register("title")}
                  placeholder="Short summary (e.g., Bribe at local office)"
                  className="mt-1 w-full border px-3 py-2 rounded"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm">Department *</label>
                <select
                  {...register("department")}
                  className="mt-1 w-full border px-3 py-2 rounded"
                >
                  <option value="">Select department</option>
                  <option>Licensing</option>
                  <option>Procurement</option>
                  <option>Personnel</option>
                </select>
                {errors.department && (
                  <p className="text-sm text-red-600">
                    {errors.department.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm">Description *</label>
                <textarea
                  {...register("description")}
                  rows={6}
                  placeholder="Describe what happened, when, who was involved"
                  className="mt-1 w-full border px-3 py-2 rounded"
                />
                {errors.description && (
                  <p className="text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold">Location & Evidence</h3>
            <div className="mt-3 grid grid-cols-1 gap-4">
              {/* Location Section */}
              <div>
                <label className="text-sm">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={locationDetails?.displayAddress || ""}
                    readOnly
                    placeholder="Click 'Detect My Location' to auto-fill location"
                    className="mt-1 flex-1 border px-3 py-2 rounded bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={isGettingLocation}
                    className="mt-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isGettingLocation ? "Detecting..." : "Detect My Location"}
                  </button>
                </div>
                {locationDetails && (
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {locationDetails.latitude.toFixed(6)}, {locationDetails.longitude.toFixed(6)} | Accuracy: ±{locationDetails.accuracy.toFixed(0)}m
                  </p>
                )}
                {locationStatus.message && (
                  <p className={`text-sm mt-1 ${locationStatus.type === "error" ? "text-red-600" : "text-green-700"}`}>
                    {locationStatus.message}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <input
                    type="text"
                    value={locationDetails?.city || ""}
                    readOnly
                    placeholder="City"
                    className="border px-3 py-2 rounded bg-gray-50"
                  />
                  <input
                    type="text"
                    value={locationDetails?.area || ""}
                    readOnly
                    placeholder="Area / Suburb"
                    className="border px-3 py-2 rounded bg-gray-50"
                  />
                  <input
                    type="text"
                    value={locationDetails?.state || ""}
                    readOnly
                    placeholder="State"
                    className="border px-3 py-2 rounded bg-gray-50"
                  />
                  <input
                    type="text"
                    value={locationDetails?.pincode || ""}
                    readOnly
                    placeholder="Pincode"
                    className="border px-3 py-2 rounded bg-gray-50"
                  />
                </div>

                <input
                  type="hidden"
                  {...register("location")}
                />
              </div>

              {/* Camera Section */}
              <div>
                <label className="text-sm">Evidence Photo</label>
                <div className="mt-1 space-y-2">
                  {!isCapturingImage ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Capture Photo
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full border rounded"
                          style={{ maxHeight: "300px" }}
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={captureImage}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Capture
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {imagePreview && !isCapturingImage && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Captured/Selected Image:</p>
                      <img
                        src={imagePreview}
                        alt="Evidence preview"
                        className="mt-1 max-w-xs max-h-48 object-contain border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCameraImage(null);
                          setImagePreview(null);
                        }}
                        className="mt-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}

                  {/* File input as alternative */}
                  <div className="mt-2">
                    <label className="text-sm text-gray-600">Or upload existing image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-gov text-white rounded disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Complaint"}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setCameraImage(null);
                setImagePreview(null);
                setLocationDetails(null);
                setLocationStatus({ type: "", message: "" });
                stopCamera();
              }}
              className="px-5 py-2 border rounded"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
